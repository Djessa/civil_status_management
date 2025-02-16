<?php

namespace App\Controller\API;

use App\Entity\Personne;
use App\Entity\Naissance;
use App\Service\DeclarationService;
use App\Service\JSONService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Serializer\Exception\NotEncodableValueException;
use Symfony\Component\Serializer\Exception\NotNormalizableValueException;
/**
* @Route("/api/naissance")
*/
class NaissanceController extends AbstractController
{

    private $service;
    private $manager;

    public function __construct(DeclarationService $declarationService, EntityManagerInterface $em)
    {
        $this->service = $declarationService;
        $this->manager = $em;
    }

    /**
     * @Route("", name="registre_naissance", methods="GET")
     */
    public function index (JSONService $json, Request $request): Response
    {
        \define('PER_PAGE', 7);
        $naissanceRepository = $this->manager->getRepository(Naissance::class);
        $page = $request->query->get('page', 0);
        $offset = $page * PER_PAGE;
        $naissances = $naissanceRepository->findBy([], ['id' => 'DESC'], PER_PAGE, $offset);
        if($page == 0) {
            $pages = ceil(($naissanceRepository->count([]) / PER_PAGE)) ;
            return $this->json($json->normalize(['naissances' => $naissances, 'total' => $pages]), 200);
        }
        return $this->json($json->normalize($naissances), 200);
    }

    /**
     * @Route("/{id}", name="naissance", methods="GET")
     */
    public function show (JSONService $json, $id): Response
    {
        $naissance = $this->manager->getRepository(Naissance::class)->find($id);
        if($naissance) {
            return $this->json($json->normalize($naissance), 200);
        }
        return $this->json(['status' => 400, 'message' => 'Aucune fiche de naissance à cet numero'], 200);
    } 

    /**
     * @Route("/{id}", name="edit_naissance", methods="PUT")
     */
    public function edit (JSONService $json, Naissance $naissance, Request $request): Response
    {
        try {
            try {
                $data = json_decode($request->getContent());
                foreach ($data as $key => $value) {
                    $method = 'set' . \ucfirst($key);
                    if(in_array($key, ['dateDeclaration', 'heureDeclaration']))
                        $naissance->$method(new \DateTime($value));
                    else
                        $naissance->$method($value);
                }
                $this->manager->flush();
                return $this->json(['status' => 200, 'message' => 'Modification éffectuée'], 200);
            } catch(NotNormalizableValueException $e) {
                return $this->json(['status' => 400, 'message' => $e->getMessage()], 400);
            }
        } catch (NotEncodableValueException $e) {
            return $this->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * @Route("/{id}", name="delete_naissance", methods="DELETE")
     */
    public function delete ($id): Response
    {
        $naissance = $this->manager->getRepository(Naissance::class)->find($id);
        if($naissance) {
            $this->manager->remove($naissance);
            $this->manager->flush();
            return $this->json(['status' => 200, 'message' => 'Suppression réussie'], 200);
        }
        return $this->json(['status' => 400, 'message' => 'Impossible de supprimer'], 200);
    }

    /**
     * @Route("", name="declaration_naissance", methods="POST")
     */
    public function new (Request $request, SerializerInterface $serializer): Response
    {
        try {
            try {
                $data = json_decode($request->getContent());
                $errors = [];
                // en evitant le problème que javascript ne puisse pas être resoudre
                if(isset($data->naissance->date_jugement) && $data->naissance->date_jugement == '') {
                    $data->naissance->date_jugement = null;
                    if(isset($data->naissance->numero_jugement))
                        $data->naissance->numero_jugement = null;
                }
                if($data->naissance->type_declaration == 'Jugement') {
                    if(!($data->naissance->date_jugement))
                        $errors['naissance']['date_jugement'] =  'Date du jugement invalide';
                    if(!($data->naissance->numero_jugement))
                        $errors['naissance']['numero_jugement'] = 'Numéro du jugement invalide';
                } 
                $officier = $this->service->getOfficierFromDataRequest($data);
                if(!$officier)
                    $errors['officier'] = 'Officier introuvable';
                if(!isset($data->pere) || !isset($data->mere) || !isset($data->enfant) || !isset($data->naissance))
                    return $this->json(['status' => 400, 'message' => ['Obligatoire' => 'Un categorie d\'information introuvable']]);
                $pere = $serializer->deserialize(json_encode($data->pere), Personne::class, 'json');
                if($this->service->isErrorExist($pere)) {
                    $errors['pere'] = $this->service->isErrorExist($pere);
                }
                $mere = $serializer->deserialize(json_encode($data->mere), Personne::class, 'json');
                if($this->service->isErrorExist($mere)) {
                    $errors['mere'] = $this->service->isErrorExist($mere);
                }
                $declarant = null;
                if(isset($data->declarant)) {
                    $declarant = $serializer->deserialize(json_encode($data->declarant), Personne::class, 'json');
                    if($this->service->isErrorExist($declarant)) {
                        $errors['declarant'] = $this->service->isErrorExist($declarant);
                    } else {
                        $declarant = $this->service->onPersistPerson($declarant);
                    }
                }
                $enfant = $serializer->deserialize(json_encode($data->enfant), Personne::class, 'json');
                if($this->service->isErrorExist($enfant)) {
                    $errors['enfant'] = $this->service->isErrorExist($enfant);
                }
                if($this->service->isExistPerson($enfant))
                    $errors['enfant'] = ['doublons' => 'Cet enfant a déjà un fiche de naissance'];
                $naissance = $serializer->deserialize(json_encode($data->naissance), Naissance::class, 'json');
                if($this->service->isErrorExist($naissance)) {
                    if(!key_exists('naissance', $errors))
                        $errors['naissance'] = [];
                    foreach($this->service->isErrorExist($naissance) as $key => $value) {
                        $errors['naissance'][$key] = $value;
                    }
                }
                if(count($errors) > 0) 
                    return $this->json(['status' => 400, 'message' => $errors]);
                $pere = $this->service->onPersistPerson($pere);
                $mere = $this->service->onPersistPerson($mere);
                $this->service->getManager()->persist($enfant);
                $reponse = $this->service->naissance($naissance, $enfant, $pere, $mere, $declarant, $officier);
                return $this->json($reponse, 200);
            } catch(NotNormalizableValueException $e) {
                return $this->json(['status' => 400, 'message' => $e->getMessage()], 400);
            }
        } catch (NotEncodableValueException $e) {
            return $this->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * @Route("/search", name="search_naissance", methods="POST")
     */
    public function search_naissance (JSONService $json, Request $request): Response
    {
        $naissanceRepository = $this->manager->getRepository(Naissance::class);
        $personneRepository = $this->manager->getRepository(Personne::class);
        $data = json_decode($request->getContent(), true);
        $personnes = $personneRepository->search($data);
        $naissances = [];
        foreach($personnes as $personne) {
            if($personne->getNaissance() != null)
                $naissances[] = $personne->getNaissance();
        }
        return $this->json($json->normalize($naissances), 200);
    }
}
