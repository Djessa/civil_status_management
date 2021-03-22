import React, { Component } from 'react'
import SideMenu from "../components/SideMenu";
import { makeStyles, CssBaseline, createMuiTheme, ThemeProvider, Grid } from '@material-ui/core';
import Header from "../components/Header";

const theme = createMuiTheme({
    palette: {
      primary: {
        main: "#333996",
        light: '#3c44b126'
      },
      secondary: {
        main: "#f83245",
        light: '#f8324526'
      },
      background: {
        default: "#f4f5fd"
      },
    },
    overrides:{
      MuiAppBar:{
        root:{
          transform:'translateZ(0)'
        }
      }
    },
    props:{
      MuiIconButton:{
        disableRipple:true
      }
    }
});

const useStyles = makeStyles({
    appMain: {
      paddingLeft: '275px',
      width: '100%'
    }
});

export default function Home () {
    const classes = useStyles();
    return (
        <ThemeProvider theme={theme}>
            <SideMenu />
            <div className={classes.appMain}>
                <Header> 
                </Header>
            </div>
            <CssBaseline />
        </ThemeProvider>
    );
}
