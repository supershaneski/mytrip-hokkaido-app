'use client'

import React from 'react'

import { createPortal } from 'react-dom'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import MobileStepper from '@mui/material/MobileStepper'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import IconButton from '@mui/material/IconButton'
import ClearIcon from '@mui/icons-material/Clear'
import CloseIcon from '@mui/icons-material/Close'

import { getSimpleId } from '../../../lib/utils'

import useDataStore from '../../../store/datastore'

import useDarkMode from '../../../lib/usedarkmode'

import Loader from '../../../components/loader'

import classes from './sandbox.module.css'
import CustomTheme from '../../../components/customtheme'

export default function Sandbox({ params, searchParams }) {

    useDarkMode()

    const router = useRouter()

    const theme = useTheme()
    const [activeStep, setActiveStep] = React.useState(0)
    

    //const data = useDataStore((state) => state.data)
    const getData = useDataStore((state) => state.get)

    const addImage = useDataStore((state) => state.addImage)
    const getImage = useDataStore((state) => state.getImage)

    const [tripName, setTrimpName] = React.useState('')
    const [isLoading, setLoading] = React.useState(true)
    const [contentItem, setContentItem] = React.useState([])

    React.useEffect(() => {

        const data = getData(params.id)
        
        const title = data.name
        const items = data.data

        //console.log("content items", items)

        const itinerary_items = items.map((item) => {
            
            let image_data = null

            if(item.key.length > 0) {

                //console.log("-", item.key)

                const photos = getImage(item.key)

                const chance = photos.data.photos.length > 1 ? Math.round(Math.random() * (photos.data.photos.length - 1)) : 0

                //console.log(photos.data.photos[chance])

                image_data = photos.data.photos[chance]

            }

            return {
                ...item,
                image: image_data,
            }
        })

        console.log("content items", itinerary_items)

        setTrimpName(title)
        setContentItem(itinerary_items)
        setLoading(false)

    }, [])

    React.useEffect(() => {

        if(tripName) {
            document.title = tripName
        }

    }, [tripName])

    const procData = async (data) => {
        
        const tokens = data.content.split('\n')

        //console.log(tokens)

        /*const content = tokens.filter((a) => a.trim().length > 0).map((a) => {
            return {
                id: getSimpleId(),
                label: a.slice(0, 24),
                description: a
            }
        })*/

        const tmp = tokens.filter((a) => a.trim().length > 0)

        let content = []
        let index = -1

        let itinerary_name = ''
        
        for(let i = 0; i < tmp.length; i++) {

            let s = tmp[i].trim()

            if(['[welcome-message]', '[itinerary]', '[intinerary]', '[closing-message]'].some((a) => a === s)) {
                index++
                content[index] = {
                    id: getSimpleId(),
                    label: '',
                    description: '',
                    image: '',
                }
            } else if(s.indexOf('itinerary-name:') >= 0) {
                itinerary_name = s.substr(15).trim()
            } else if(s.indexOf('title:') >= 0) {
                s = s.substr(7).trim()
                content[index].label = s
            } else if(s.indexOf('image:') >= 0) {
                s = s.substr(7).trim()
                content[index].image = s
            } else {
                content[index].description = s.replace('content:', '')
            }

        }

        let images = content.filter((item) => item.image.length > 0).map((item) => item.image).filter((item) => {
            return !getImage(item)
        })

        console.log("images", images)

        /*
        const listOfImages = await Promise.all(
            Array.from(images).map(async (image) => {

                try {

                    const response = await fetch(`/image/?query=${image}`)

                    if(!response.ok) {
                        console.log('Oops, an error occurred', response.status)
                    }

                    const result = await response.json()

                    //console.log(result)

                    return {
                        key: image,
                        items: result.items,
                    }

                } catch(error) {
                    return null
                }

            })
        )

        console.log(listOfImages)

        addImage(listOfImages)
        */

        /*let images = content.filter((item) => item.image.length > 0).map((item) => item.image)

        try {

            const response = await fetch(`/image/?query=${images.join(',')}`)

            if(!response.ok) {
                console.log('Oops, an error occurred', response.status)
            }

            const result = await response.json()

            console.log(result)

        } catch(error) {
            console.log(error)
        }*/

        setTrimpName(itinerary_name)

        setContentItem(content)

        setLoading(false)

    }

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
    
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const handleClick = async (key) => {
        
        console.log('key=' + key)

        try {

            const response = await fetch(`/image/?query=${key}`)

            if(!response.ok) {
                console.log('Oops, an error occurred', response.status)
            }

            const result = await response.json()

            console.log(result)

        } catch(error) {
            console.log(error)
        }


    }

    const getDisplayImage = (key) => {

        const images = getImage(key)

        console.log("display", images, key)

        if(images) {
            const image = images.items[Math.floor((images.items.length - 1) * Math.random())]
            console.log("selected", image)
            return image.url
        } else {
            return 'none'
        }
        
    }

    const maxSteps = contentItem.length;

    return (
        <div className={classes.container}>
            <div className={classes.content}>
                {
                    contentItem.length > 0 &&
                    <Paper elevation={0}>
                    <Box sx={{ 
                        //maxWidth: 400, 
                        //boxShadow: '',
                        flexGrow: 1 
                    }}>
                    <div className={classes.panel} style={{
                        backgroundImage: contentItem[activeStep].image ? `url("${contentItem[activeStep].image?.src.large}")` : '',
                        backgroundColor: '#999',
                        backgroundSize: 'cover',
                    }}>
                        <div className={classes.contentPanel}>
                            <h4 className={classes.title}>{contentItem[activeStep].label}</h4>
                            <p className={classes.text}>{contentItem[activeStep].description}</p>
                        </div>
                        {
                            contentItem[activeStep].image &&
                            <div className={classes.credit}>
                                <div className={classes.logo}>
                                    <img onClick={() => handleClick(contentItem[activeStep].image)} src="https://images.pexels.com/lib/api/pexels-white.png" />
                                </div>
                                <div className={classes.photog}>
                                    <a className={classes.link} href={contentItem[activeStep].image.photographer_url} target='_blank'>Photo by {contentItem[activeStep].image.photographer}</a>
                                </div>
                            </div>
                        }
                    </div>
                    <MobileStepper
                        variant="text"
                        steps={maxSteps}
                        position="static"
                        activeStep={activeStep}
                        nextButton={
                        <Button
                            size="small"
                            onClick={handleNext}
                            disabled={activeStep === maxSteps - 1}
                        >
                            Next
                            {theme.direction === 'rtl' ? (
                            <KeyboardArrowLeft />
                            ) : (
                            <KeyboardArrowRight />
                            )}
                        </Button>
                        }
                        backButton={
                        <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                            {theme.direction === 'rtl' ? (
                            <KeyboardArrowRight />
                            ) : (
                            <KeyboardArrowLeft />
                            )}
                            Back
                        </Button>
                        }
                    />
                    </Box>
                    </Paper>
                }
                <div className={classes.close}>
                    <CustomTheme>
                        <IconButton onClick={() => router.push('/')}>
                            <CloseIcon sx={{ color: '#dcdcdc' }} />
                        </IconButton>
                    </CustomTheme>
                </div>
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