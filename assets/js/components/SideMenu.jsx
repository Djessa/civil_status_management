import React, { useState } from 'react'
import { Button, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { NavLink } from "react-router-dom";
import EqualizerIcon from '@material-ui/icons/Equalizer';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import { Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';

const SideMenu = (props) => {

    return (
        <div className="sideMenu">
            <div  className="appLogo">
                <img src="/images/flag.jpg" alt="drapeau" className="img-fluid rounded shadow"/>
                <span>Etat civil</span>
            </div>
            <div className="space"></div>
            <div className="navigation">
                <List>
                    <ListItem>
                        <NavLink to="/declaration" className="link">
                            <GroupAddIcon  />
                            <span>Déclaration</span>
                        </NavLink>
                    </ListItem>
                    <ListItem>
                        <NavLink to="/" className="link">
                            <ViewListIcon  />
                            <span>Régistre</span>
                        </NavLink>
                    </ListItem>
                    <ListItem>
                        <NavLink to="/" className="link">
                            <EqualizerIcon  />
                            <span>Statistique</span>
                        </NavLink>
                    </ListItem>
                    <ListItem>
                        <NavLink to="/" className="link">
                            <SettingsIcon  />
                            <span>Administration</span>
                        </NavLink>
                    </ListItem>
                </List>
            </div>
            <div className="footer">
                coopyright &copy; 2021
            </div> 
        </div>
    )
}

export default SideMenu