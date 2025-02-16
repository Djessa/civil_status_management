import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, IconButton, TextField, Grid } from '@material-ui/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mini_date, WEBROOT } from '../uses/const';
import TableCellsHead from '../components/TableCellsHead';
import '../styles/registre.css';
import { Search } from '@material-ui/icons';
import AppProvider from '../components/AppProvider';
import Header from '../components/Header';

export default function RegistreNaissance() {

    const [registre, setRegistre] = useState([]);
    const [page, setPage] = useState(0);
    const [nbrePage, setNbrePage] = useState(0);
    const [chargement, setChargement] = useState(false);
    const [searchData, setSearchData] = useState({ nom: '', prenom: '', });
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        setChargement(true);
        axios.get(WEBROOT + 'api/naissance?page=' + page)
            .then(response => {
                if (page == 0) {
                    setRegistre(response.data.naissances);
                    setNbrePage(response.data.total)
                } else setRegistre(response.data)
                setChargement(false)
            })
            .catch(error => console.log(error))
    }, [page, refresh]);

    const incrementPage = () => {
        if (page < nbrePage - 1) setPage(page + 1);
    }

    const decrementPage = () => {
        if (page > 0) setPage(page - 1);
    }

    const search = () => {
        const data = {};
        let valid = false;
        if (searchData.nom !== '') {
            data.nom = searchData.nom
            valid = true
        }
        if (searchData.prenom !== '') {
            data.prenom = searchData.prenom
            valid = true
        }
        if (valid) {
            setChargement(true);
            axios.post(WEBROOT + 'api/naissance/search', data)
                .then((response) => {
                    if (response.data.length > 0) {
                        setRegistre(response.data)
                        setChargement(false);
                    }
                    else {
                        alert('Aucune resultat pour ces informations');
                        setRefresh(!refresh);
                    }
                })
                .catch(error => console.log(error))
        }
    }

    const handleChange = (property, e) => {
        const objet = Object.assign({}, searchData);
        objet[property] = e.target.value;
        setSearchData(objet);
    }

    return (
        <AppProvider>
            <Header>
                <Grid lg={5} md={5} item>
                    <TextField
                        label="Nom"
                        fullWidth={true}
                        value={searchData.nom}
                        onChange={(e) => handleChange('nom', e)}
                    />
                </Grid>
                <Grid lg={5} md={5} item>
                    <TextField
                        label="Prénom"
                        fullWidth={true}
                        value={searchData.prenom}
                        onChange={(e) => handleChange('prenom', e)}
                    />
                </Grid>
                <Grid item>
                    <IconButton onClick={search}>
                        <Search />
                    </IconButton>
                </Grid>
            </Header>
            <div className="declaration_content">
                <Table>
                    <TableHead className="registre">
                        <TableCellsHead bgClass="bg-primary" columns={['ID', 'Nom', 'Prénom', 'Sexe', 'Date de naissance', 'Lieu de naissance', '']} />
                    </TableHead>
                    <TableBody>
                        {
                            (!chargement)
                                ?
                                registre.map((data, index) => {
                                    return <TableRow key={index}>
                                        <TableCell>{data.id}</TableCell>
                                        <TableCell>{data.enfant.nom}</TableCell>
                                        <TableCell>{data.enfant.prenom}</TableCell>
                                        <TableCell>{data.enfant.sexe}</TableCell>
                                        <TableCell>{mini_date(data.enfant.date_naissance)}</TableCell>
                                        <TableCell>{data.enfant.lieu_naissance}</TableCell>
                                        <TableCell>
                                            <Link className="btn btn-success mr-1" to={WEBROOT + 'show/copie/naissance/' + data.id}>
                                                Copie
                                    </Link>
                                            <Link className="btn btn-success mr-1" to={WEBROOT + 'show/extrait/naissance/' + data.id}>
                                                Extrait
                                    </Link>
                                        </TableCell>
                                    </TableRow>
                                })
                                :
                                <TableRow>
                                    <TableCell colSpan="7" align="center" style={{ fontSize: '1.1em' }}>Chargement en cours...</TableCell>
                                </TableRow>
                        }
                    </TableBody>
                </Table>
                <div style={{ position: 'fixed', bottom: '10px' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <IconButton size="small" style={{ padding: '10px' }} onClick={decrementPage}>Précedent</IconButton>
                        <IconButton size="small" style={{ padding: '10px' }} onClick={incrementPage}>Suivant</IconButton>
                    </div>
                </div>
            </div>
        </AppProvider>
    )
}