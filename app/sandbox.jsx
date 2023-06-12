'use client'

import React from 'react'

import { createPortal } from 'react-dom'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import ClearIcon from '@mui/icons-material/Clear'
import SendIcon from '@mui/icons-material/Send'
import QuizIcon from '@mui/icons-material/Quiz'
import ChatIcon from '@mui/icons-material/Forum'
import DeleteIcon from '@mui/icons-material/DeleteForever'
import SearchIcon from '@mui/icons-material/Search'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CreateIcon from '@mui/icons-material/BorderColor'
import ResetIcon from '@mui/icons-material/RestartAlt'

import CustomTheme from '../components/customtheme'

import Loader from '../components/loader'

import captions from '../assets/captions.json'
import useCaption from '../lib/usecaption'

import useDarkMode from '../lib/usedarkmode'

import classes from './sandbox.module.css'

export default function Sandbox() {

    useDarkMode()

    const setCaption = useCaption(captions)

    const searchRef = React.useRef(null)

    const [query, setQuery] = React.useState('')
    const [isLoading, setLoading] = React.useState(false)

    const handleSearch = (e) => {
        e.preventDefault()

        setLoading(true)

        const search = query
        setQuery('')
        
        console.log(`Search: ${search}`)

        handleTrip(search)
        
    }

    const handleTrip = async (place) => {

        const previous = []

        /*
        Write Day Trip Plan and a hotel near Sapporo, Japan
        */

        /*
        Write Day Trip Plan and a hotel for Sapporo, Japan
        */

        /*
        Write Day Trip Plan and three hotel suggestions in Sapporo, Japan
        */

        /*
        Write Day Trip Plan with focus in history and give three hotel suggestions that will be convenient for the locations of destinations in Sapporo, Japan
        */

        const system = `Write Day Trip Plan around ${place}`

        try {
            
            const response = await fetch('/api/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    system, // system
                    inquiry: '', // inquiry
                    previous, // previous
                })
            })

            if(!response.ok) {
                console.log('Oops, an error occurred', response.status)
            }

            const result = await response.json()

            console.log(result)

        } catch(error) {
            
            console.log(error)

        }

        setLoading(false)

    }

    return (
        <div className={classes.container}>
            <div className={classes.center}>
                <CustomTheme>
                    <Box 
                    component="form" 
                    onSubmit={handleSearch}
                    noValidate>
                        <TextField 
                        placeholder={setCaption('placeholder-search')} //'Where do you want to go?'
                        disabled={isLoading}
                        fullWidth
                        //multiline
                        //maxRows={6}
                        inputRef={searchRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        /*inputProps={{
                            className: classes.chatInput,
                        }}*/
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                    disabled={isLoading || query.length === 0}
                                    onClick={handleSearch}
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        />
                    </Box>
                </CustomTheme>
            </div>
            {
                isLoading && createPortal(
                    <Loader />,
                    document.body
                )
            }
        </div>
    )
}