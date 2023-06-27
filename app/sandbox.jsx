'use client'

import React from 'react'
import { createPortal } from 'react-dom'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/DeleteForever'
import SearchIcon from '@mui/icons-material/Search'

import { getSimpleId, getDateDiff, getDateTime } from '../lib/utils'

import CustomTheme from '../components/customtheme'
import Loader from '../components/loader'
import Dialog from '../components/dialog'
import captions from '../assets/captions.json'
import useCaption from '../lib/usecaption'
import useDarkMode from '../lib/usedarkmode'
import useDataStore from '../store/datastore'
import useAppStore from '../store/appstore'

import classes from './sandbox.module.css'

export default function Sandbox() {

    useDarkMode()

    const router = useRouter()

    const setCaption = useCaption(captions)

    const defSearchKey = useAppStore((state) => state.search)
    const setSearchKey = useAppStore((state) => state.setSearch)

    const data = useDataStore((state) => state.data)
    const addData = useDataStore((state) => state.add)
    const deleteData = useDataStore((state) => state.delete)
    //const getData = useDataStore((state) => state.getByName)

    const addImageData = useDataStore((state) => state.addImage)
    const getImageData = useDataStore((state) => state.getImage)

    const searchRef = React.useRef(null)

    const [dataItems, setDataItems] = React.useState([])

    const [query, setQuery] = React.useState('')
    const deferredQuery = React.useDeferredValue(query)

    const [isLoading, setLoading] = React.useState(false)
    const [openDialog, setOpenDialog] = React.useState(false)
    const [paramId, setParamId] = React.useState('')
    const [selName, setSelName] = React.useState('')

    const [errorMessage, setErrorMessage] = React.useState('')

    React.useEffect(() => {

        document.title = process.env.siteTitle

        setQuery(defSearchKey)

        if(data.length > 0) {

            setDataItems(data)

        }

    }, [])

    const handleSearch = (e) => {
        e.preventDefault()

        setLoading(true)

        searchRef.current.blur()

        handleTrip(query)
        
    }

    const handleTrip = async (place) => {

        let test_place = place
        let test_decription = ''

        try {

            const response_find = await fetch('/find/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inquiry: place,
                })
            })

            if(!response_find.ok) {
                console.log('Oops, an error occurred 1', response_find.status)
            }

            const result_find = await response_find.json()

            console.log('find', result_find)

            if(result_find.data.content === null) {

                const find_args = JSON.parse(result_find.data.function_call.arguments)

                test_place = find_args.location ? find_args.location : ''
                test_decription = find_args.hasOwnProperty('description') ? find_args.description : 'day trip'

                const isHokkaido = find_args.hasOwnProperty('isHokkaido') ? find_args.isHokkaido : true

                console.log('isHokkaido', isHokkaido, typeof isHokkaido)

                if(!isHokkaido) {
                    
                    //setErrorMessage('Please specify the specific place you want to visit within Hokkaido.')
                    setErrorMessage(setCaption('error-not-hokkaido'))

                    setLoading(false)
                    return

                }

            }

        } catch(error) {

            console.log('find', error)

            // we are just assuming here that the error is a result 
            // of not finding location in prompt.

            test_place = '' 
            
        }

        if(test_place.length === 0) {

            //setErrorMessage('Please provide the name of the place you wish to visit.')
            setErrorMessage(setCaption('error-missing-location'))

            setLoading(false)
            return
        }

        /*
        try {

            const response_location = await fetch('/location/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: test_place,
                })
            })

            if(!response_location.ok) {
                console.log('Oops, an error occurred', response_location.status)
            }

            const result_location = await response_location.json()

            test_place = result_location.text.indexOf('NOT-HOKKAIDO') >= 0 ? '' : [test_place, result_location.text].join(', ')

        } catch(error) {
            console.log(error)
        }

        // test
        test_place = ''

        if(test_place.length === 0) { // show error

            setErrorMessage('You need to specify place found within Hokkaido.')

            setLoading(false)
            return
        }
        */
        
        const previous = []

        const system = `You are a helpful travel planner specializing in Hokkaido, Japan.\n` +
            `You will reply in the following format:\n` +
            `itinerary-name: Trip Name\n` +
            `[welcome-message]\n` +
            `title: welcome message title\n` +
            `content: welcome message text\n` +
            `image: welcome image keyword\n` +
            `[itinerary]\n` +
            `title: itinerary title\n` +
            `content: itinerary message text\n` +
            `image: itinerary image keyword\n` +
            `places: place1, place2\n` +
            `[itinerary]\n` +
            `title: itinerary title\n` +
            `content: itinerary message text\n` +
            `image: itinerary image keyword\n` +
            `places: place1\n` +
            `[itinerary]\n` +
            `title: itinerary title\n` +
            `content: itinerary message text\n` +
            `image: itinerary image keyword\n` +
            `places: place1, place2, place3\n` +
            `[closing-message]\n` +
            `title: closing message title\n` +
            `content: closing message text\n` +
            `image: closing image keyword\n` +
            `places: place1, place2`

        const inquiry = `Write a Trip Plan for ${test_decription} in ${test_place}`

        console.log(inquiry)
        
        try {
            
            const response = await fetch('/api/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    system, // system
                    inquiry, // inquiry
                    previous, // previous
                })
            })

            if(!response.ok) {
                console.log('Oops, an error occurred', response.status)
            }

            const result = await response.json()

            //console.log(result)

            const trip_data = procResult(result.text)

            const image_list = trip_data.data.filter(a => a.key.length > 0).map(a => a.key).filter(a => !getImageData(a))

            if(image_list.length > 0) {

                try {

                    const response_images = await fetch('/image/', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            images: image_list,
                        })
                    })
    
                    if(!response_images.ok) {
                        console.log("Oops, an error occurred", response_images.status)
                    }
    
                    const ret_images = await response_images.json()
    
                    console.log(ret_images)

                    addImageData(ret_images.data)
    
                } catch(error) {
                    console.log(error)
                }

            }

            const newId = getSimpleId()

            const newData = {
                ...trip_data,
                id: newId,
                query: place,
                content: result.text,
                datetime: (new Date()).toISOString(),
            }

            addData(newData)

            router.push(`/trip/${newId}`)
            
        } catch(error) {
            
            console.log(error)

            //setErrorMessage('Sorry, an unexpected error has occurred. Please try again later.')
            setErrorMessage(setCaption('error-unexpecte'))

            setLoading(false)

        }
        

    }

    const getContentType = (txt) => {
        switch(txt) {
            case '[welcome-message]':
                return 0
            case '[closing-message]':
                return 1
            default:
                return 2
        }
    }

    const procResult = (txt) => {
        
        let token_str = txt.split('\n').filter(a => a.trim().length > 0)

        let trip_name = ''
        let content = []
        let index = -1

        for (let i = 0; i < token_str.length; i++) {

            let str = token_str[i].trim()

            //console.log(i, str)

            if(str.length === 0) continue

            if(str.indexOf('itinerary-name:') >= 0) {

                trip_name = str.substr(15).trim()

            } else if(['[welcome-message]', '[itinerary]', '[closing-message]'].some(a => a === str)) {

                index++

                content[index] = {
                    id: getSimpleId(),
                    label: '',
                    description: '',
                    type: getContentType(str),
                    key: '',
                    image: '',
                    places: '',
                }

            } else if(str.indexOf('title:') >= 0) {

                str = str.substr(7).trim()

                content[index].label = str

            } else if(str.indexOf('image:') >= 0) {

                str = str.substr(7).trim()

                content[index].key = str

            } else if(str.indexOf('places:') >= 0) {

                str = str.substr(7).trim()

                content[index].places = str

            } else {

                content[index].description = str.replace('content:', '')

            }

        }

        return {
            name: trip_name,
            data: content,
        }

    }

    const handleDelete = (id, name) => {
        
        setParamId(id)
        setSelName(name)

        setOpenDialog(true)

    }
    
    const handleConfirmDelete = (id) => {
        
        deleteData(id)

        setDataItems((prev) => prev.slice(0).filter((item) => item.id !== id))

        setOpenDialog(false)

    }

    const handleCloseDialog = () => {

        setParamId('')
        setOpenDialog(false)

    }

    const handleQuery = (s) => {
        setErrorMessage('')
        setQuery(s)
        setSearchKey(s)
    }

    const dataFiltered = dataItems.filter((item) => {
        return deferredQuery.length > 2 ? (item.name.toLowerCase().indexOf(deferredQuery.toLowerCase()) >= 0 || item.query.toLowerCase().indexOf(deferredQuery.toLowerCase()) >= 0) : false
    }).sort((a, b) => {
        if(a.datetime > b.datetime) return -1
        if(a.datetime < b.datetime) return 1
        return 0
    })

    return (
        <div className={classes.container}>
            <div className={classes.main}>
                <div className={classes.search}>
                    <CustomTheme>
                        <Box 
                        component="form" 
                        onSubmit={handleSearch}
                        noValidate>
                            <TextField 
                            error={errorMessage.length > 0}
                            helperText={errorMessage}
                            placeholder={setCaption('placeholder-search')}
                            disabled={isLoading}
                            fullWidth
                            inputRef={searchRef}
                            value={query}
                            onChange={(e) => handleQuery(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <React.Fragment>
                                            <IconButton
                                            disabled={isLoading || query.length === 0}
                                            onClick={() => handleQuery('')}
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                            <IconButton
                                            disabled={isLoading || query.length === 0}
                                            onClick={handleSearch}
                                            >
                                                <SearchIcon />
                                            </IconButton>
                                        </React.Fragment>
                                    </InputAdornment>
                                ),
                            }}
                            />
                        </Box>
                    </CustomTheme>
                </div>
                { 
                    dataFiltered.length > 0 &&
                    <div className={classes.recommended}>
                        <h4 className={classes.title}>
                            { dataFiltered.length > 1 ? `${setCaption('suggestion1')} ${dataFiltered.length} ${setCaption('suggestion2')}` : setCaption('suggestion3') }
                        </h4>
                        <ul className={classes.list}>
                            {
                                dataFiltered.map((item) => {
                                    const sDateTime = getDateTime(item.datetime)
                                    const sAgo = getDateDiff(item.datetime)
                                    return (
                                        <li key={item.id} className={classes.listItem}>
                                            <div className={item.id === paramId ? [classes.itemContainer, classes.selected].join(' ') : classes.itemContainer}>
                                                <div className={classes.item}>
                                                    <Link className={classes.link} href={`/trip/${item.id}`} onClick={() => setLoading(true)}>
                                                        <div className={classes.name}>
                                                            <span>{ item.name }</span>
                                                        </div>
                                                    </Link>
                                                    <div className={classes.datetime}>
                                                        <span className={classes.date}>{ sDateTime }</span><span className={classes.ago}>{ sAgo }</span>
                                                    </div>
                                                </div>
                                                <div className={classes.delete}>
                                                    <CustomTheme>
                                                        <IconButton onClick={() => handleDelete(item.id, item.name)}>
                                                            <DeleteIcon sx={{color: '#a3a0a2'}} />
                                                        </IconButton>
                                                    </CustomTheme>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                }
                
            </div>
            {
                isLoading && createPortal(
                    <Loader />,
                    document.body
                )
            }
            {
                openDialog && createPortal(
                    <Dialog 
                    caption={selName}
                    param={paramId}
                    onConfirm={handleConfirmDelete}
                    onClose={handleCloseDialog}
                    />,
                    document.body
                )
            }
        </div>
    )
}