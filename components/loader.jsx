'use client'

import React from 'react'

//import CircularProgress from '@mui/material/CircularProgress'
import FlightIcon from '@mui/icons-material/Flight'
//<CircularProgress color='inherit' />

import classes from './loader.module.css'

export default function Loader() {
    return (
        <div style={{
            backgroundColor: '#3573',
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff9',
        }}>
            <div className={classes.main}>
                <div className={classes.loader}>
                    <div className={classes.loaderIcon}>
                        <FlightIcon className={classes.icon} />
                    </div>
                </div>
                <div className={classes.loader2}>
                    <div className={classes.loaderIcon}>
                        <FlightIcon className={classes.icon2} />
                    </div>
                </div>
            </div>
        </div>
    )
}