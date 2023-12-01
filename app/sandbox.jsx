'use client'

import React from 'react'
import { createPortal } from 'react-dom'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
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
//import captions from '../assets/captions.json'
//import useCaption from '../lib/usecaption'
import useDarkMode from '../lib/usedarkmode'
import useDataStore from '../store/datastore'
import useAppStore from '../store/appstore'

import classes from './sandbox.module.css'

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
})

export default function Sandbox() {

    useDarkMode()

    const router = useRouter()

    //const setCaption = useCaption(captions)

    const defSearchKey = useAppStore((state) => state.search)
    const setSearchKey = useAppStore((state) => state.setSearch)

    const backdrop = useDataStore((state) => state.backdrop)
    const setBackdrop = useDataStore((state) => state.setBackdrop)

    const data = useDataStore((state) => state.data)
    const addData = useDataStore((state) => state.add)
    const deleteData = useDataStore((state) => state.delete)

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

    const [openSnack, setOpenSnack] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState('')
    const [snackMode, setSnackMode] = React.useState('success')

    const [messageItems, setMessageItems] = React.useState([])

    const [backgroundImage, setBackgroundImage] = React.useState(null)

    React.useEffect(() => {

        document.title = `My Trip ${process.env.appLocation}` //process.env.siteTitle

        setQuery(defSearchKey)

        let flag_backdrop = false
        if(backdrop) {

            if(backdrop.key === process.env.appLocation) {
                flag_backdrop = true
                const chance = Math.floor(backdrop.image.length * Math.random())
                setBackgroundImage(backdrop.image[chance].src.large)
            }

        }

        if(!flag_backdrop) {
            getImageBackdrop()
        }

        if(data.length > 0) {

            setDataItems(data)

        }

    }, [])

    const getImageBackdrop = async () => {

        console.log("image backdrop")

        try {
    
            const response_images = await fetch('/image/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    images: [process.env.appLocation],
                })
            })

            const ret_images = await response_images.json()

            if(ret_images.data[0].data.photos.length > 0) {
                const chance = Math.floor(ret_images.data[0].data.photos.length * Math.random())
                const selected_photo = ret_images.data[0].data.photos[chance].src.large
                setBackdrop({
                    key: process.env.appLocation,
                    image: ret_images.data[0].data.photos
                })
                setBackgroundImage(selected_photo)
            }

        } catch(error) {
            
            console.log(error.name, error.message)

        }

    }

    const handleCloseSnack = () => {
        setOpenSnack(false)
    }

    const handleSearch = (e) => {
        e.preventDefault()

        setLoading(true)

        searchRef.current.blur()

        handleTrip(query)
        
    }

    const handleTrip = async (inquiry) => {

        console.log('Creating itinerary...', (new Date()).toLocaleTimeString())
        
        const previous = messageItems.slice(0)

        setMessageItems((prev) => [...prev, ...[{ role: 'user', content: inquiry }]])

        try {
            
            const response = await fetch('/api/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inquiry,
                    previous
                })
            })

            const result = await response.json()

            console.log("result", result)

            if(result.status === 'error') {
                
                if(result.text === 'invalid place') {
                    
                    setMessageItems([]) // reset

                    setSnackMessage(`Please choose a specific place to visit in ${process.env.appLocation}.`)

                } else {

                    setMessageItems((prev) => [...prev, ...[{ role: 'assistant', content: result.text }]])

                    setSnackMessage(result.text)

                }
                
                setSnackMode('info')
                setOpenSnack(true)

                setLoading(false)

            } else {

                setMessageItems([])

                const raw_trip_data = JSON.parse(result.output)

                console.log("raw-trip", raw_trip_data)

                let all_image_keys = []

                for(let panel in raw_trip_data) {
                    if(raw_trip_data.hasOwnProperty(panel)) {
                        if(panel == 'welcome' || panel == 'closing') {
                            all_image_keys.push(raw_trip_data[panel].image)
                        } else if(panel == 'itineraries') {
                            for(let item of raw_trip_data[panel]) {
                                all_image_keys.push(item.image)
                            }
                        }
                    }
                }

                const image_keys = all_image_keys.filter((img) => !getImageData(img))

                if(image_keys.length > 0) {
                    
                    console.log("image-list", image_keys)

                    await getPicsFromImageServer(image_keys)

                }

                const newId = getSimpleId()

                const newData = {
                    ...raw_trip_data,
                    id: newId,
                    query: inquiry,
                    content: raw_trip_data,
                    datetime: (new Date()).toISOString(),
                    images: all_image_keys,
                }

                addData(newData)

                setTimeout(() => {
                    router.push(`/trip/${newId}`)
                }, 200) // Add delay
                
            }

        } catch(error) {
            
            console.log("main", error.name, error.message)

            setMessageItems([])

            setSnackMessage('Sorry, an unexpected error has occurred. Please try again. If the problem persists, consider checking your internet connection or restarting your device.')

            setSnackMode('error')
            setOpenSnack(true)

            setLoading(false)
            
        }
        

    }

    const getPicsFromImageServer = async (images) => {

        try {
    
            const response_images = await fetch('/image/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    images: images,
                })
            })

            const ret_images = await response_images.json()

            console.log('images', ret_images)

            addImageData(ret_images.data)

        } catch(error) {
            
            console.log(error.name, error.message)

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

    const getRecommendCaption = (n) => {
        return n > 1 ? `Here are your ${n} suggestions` : `Here's a suggestion for you`
    }

    const dataFiltered = dataItems.filter((item) => {
        return deferredQuery.length > 2 ? (item.title.toLowerCase().indexOf(deferredQuery.toLowerCase()) >= 0 || item.query.toLowerCase().indexOf(deferredQuery.toLowerCase()) >= 0) : false
    }).sort((a, b) => {
        if(a.datetime > b.datetime) return -1
        if(a.datetime < b.datetime) return 1
        return 0
    })

    return (
        <React.Fragment>
        <div className={classes.container} style={{
            backgroundImage: `radial-gradient(circle at right bottom, #fffb 5%, #fff), url("${backgroundImage}")`,
            //backgroundImage: `linear-gradient(#fff 15%, transparent 95%), url("${backgroundImage}")`,
            backgroundSize: 'cover',
            //backgroundBlendMode: 'screen',
        }}>
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
                            placeholder={`Day trip in ${process.env.appLocation}`}
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
                        <h4 className={classes.title}>{ getRecommendCaption(dataFiltered.length) }</h4>
                        <div className={classes.listPanel}>
                        <ul className={classes.list}>
                            {
                                dataFiltered.map((item) => {
                                    const sDateTime = getDateTime(item.datetime)
                                    const sAgo = getDateDiff(item.datetime)
                                    return (
                                        <li key={item.id} className={classes.listItem}>
                                            <div className={item.id === paramId ? [classes.itemContainer, classes.selected].join(' ') : classes.itemContainer}>
                                                <div className={classes.item}>
                                                    <div className={classes.itemTop}>
                                                        <Link className={classes.link} href={`/trip/${item.id}`} onClick={() => setLoading(true)}>
                                                            <div className={classes.name}>
                                                                <span>{ item.title }</span>
                                                            </div>
                                                        </Link>
                                                        <CustomTheme>
                                                            <IconButton sx={{ marginLeft: '5px' }} size='small' onClick={() => handleDelete(item.id, item.title)}>
                                                                <DeleteIcon fontSize='inherit' className={classes.deleteIcon} />
                                                            </IconButton>
                                                        </CustomTheme>
                                                    </div>
                                                    <div className={classes.datetime}>
                                                        <span className={classes.date}>{ sDateTime }</span><span className={classes.ago}>{ sAgo }</span>
                                                    </div>
                                                </div>
                                                <div className={classes.images}>
                                                {
                                                    item.images && item.images.filter((img, index) => {
                                                        const photos = getImageData(img)
                                                        if(!photos) return false
                                                        if(photos.data.photos.length === 0) return false
                                                        return index < 5
                                                    }).map((img, index) => {
                                                        const photos = getImageData(img)
                                                        const chance = Math.floor(photos.data.photos.length * Math.random())
                                                        const photo = photos.data.photos[chance]
                                                        return (
                                                            <img key={index} className={classes.thumb} src={photo.src.tiny} alt={photo.alt} />
                                                        )
                                                    })
                                                }
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        </div>
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
            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity={snackMode} sx={{ width: '90%' }}>
                { snackMessage }
                </Alert>
            </Snackbar>
        </React.Fragment>
    )
}