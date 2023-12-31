'use client'

import React from 'react'

import { createPortal } from 'react-dom'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import MobileStepper from '@mui/material/MobileStepper'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import useDarkMode from '../../../lib/usedarkmode'
import useDataStore from '../../../store/datastore'

//import captions from '../../../assets/captions.json'
//import useCaption from '../../../lib/usecaption'

import Loader from '../../../components/loader'
import CustomTheme from '../../../components/customtheme'

import classes from './sandbox.module.css'

export default function Sandbox({ params }) {

    useDarkMode()

    const router = useRouter()

    const theme = useTheme()

    //const setCaption = useCaption(captions)

    const [activeStep, setActiveStep] = React.useState(0)
    
    const getData = useDataStore((state) => state.get)
    const getImage = useDataStore((state) => state.getImage)

    const [tripName, setTrimpName] = React.useState('')
    const [isLoading, setLoading] = React.useState(true)
    const [contentItem, setContentItem] = React.useState([])

    React.useEffect(() => {

        const data = getData(params.id)
        
        const title = data.title
        let items = []
        items.push(data.welcome)

        for(let itinerary of data.itineraries) {
            items.push(itinerary)
        }

        items.push(data.closing)

        const itinerary_items = items.map((item) => {
            
            let image_data = null

            if(item.image.length > 0) {

                const photos = getImage(item.image)

                const chance = photos.data.photos.length > 1 ? Math.round(Math.random() * (photos.data.photos.length - 1)) : 0

                image_data = photos.data.photos[chance]

            }

            return {
                ...item,
                image: image_data,
            }
        })

        console.log(itinerary_items)

        setTrimpName(title)
        setContentItem(itinerary_items)
        setLoading(false)

    }, [])

    React.useEffect(() => {

        if(tripName) {
            document.title = tripName
        }

    }, [tripName])
    
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
    
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const getMapLink = (str) => {
        const encodedStr = encodeURIComponent(str)
        return `https://www.google.com/maps/search/?api=1&query=${encodedStr}`
    }

    const maxSteps = contentItem.length;

    return (
        <div className={classes.container}>
            <div className={classes.content}>
                {
                    contentItem.length > 0 &&
                    <Paper elevation={0}>
                    <Box sx={{ 
                        flexGrow: 1 
                    }}>
                    <div className={classes.panel} style={{
                        backgroundImage: contentItem[activeStep].image ? `url("${contentItem[activeStep].image?.src.large}")` : '',
                        backgroundColor: '#999',
                        backgroundSize: 'cover',
                    }}>
                        <div className={classes.contentPanel}>
                            <h4 className={classes.title}>{contentItem[activeStep].title}</h4>
                            <p className={classes.text}>{contentItem[activeStep].text}</p>
                            {
                                contentItem[activeStep].text.charAt(contentItem[activeStep].text.length - 1) === ':' && contentItem[activeStep].hasOwnProperty('places') &&
                                <div className={classes.places}>
                                    <ul className={classes.list}>
                                    {
                                    contentItem[activeStep].places.map((place, i) => {
                                        return (
                                            <li key={i} className={classes.listItem}>{ place }</li>
                                        )
                                    })
                                    }
                                    </ul>
                                </div>
                            }
                            {
                                contentItem[activeStep].text.charAt(contentItem[activeStep].text.length - 1) !== ':' && contentItem[activeStep].hasOwnProperty('places') && contentItem[activeStep].places.length > 0 && 
                                <div className={classes.places}>
                                    <span>Explore more:</span>
                                    <ul className={classes.list2}>
                                    {
                                    contentItem[activeStep].places.map((place, i) => {
                                        return (
                                            <li key={i} className={classes.listItem2}><a className={classes.link2} href={getMapLink(place)} target='_blank'>{ place }</a></li>
                                        )
                                    })
                                    }
                                    </ul>
                                </div>
                            }
                        </div>
                        {
                            contentItem[activeStep].image &&
                            <div className={classes.credit}>
                                <div className={classes.logo}>
                                    <a href="https://www.pexels.com" target='_blank'>
                                        <img src="https://images.pexels.com/lib/api/pexels-white.png" />
                                    </a>
                                </div>
                                <div className={classes.photog}>
                                    <a className={classes.link} href={contentItem[activeStep].image.photographer_url} target='_blank'>{`photo by ${contentItem[activeStep].image.photographer}`}</a>
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
                            <CloseIcon className={classes.closeIcon} />
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