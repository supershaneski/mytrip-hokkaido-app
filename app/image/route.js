import { createClient } from 'pexels'

import { getUniqueId2 } from '../../lib/utils'

const client = createClient(process.env.PEXELS_API_KEY)

export async function POST(request) {

    const { images } = await request.json()
    
    if (!Array.isArray(images)) {
        return new Response('Bad chunks', {
            status: 400,
        })
    }

    //console.log("images", images)


    /*client.photos.search({ image, per_page: 3 }).then((photos) => {
        
        console.log(photos)

        return photos
        

    })*/


    const result = await Promise.all(
        Array.from(images).map(async (image) => {

            try {

                //const photos = await client.photos.search({ image, per_page: 3 })
                //return photos

                /*return {
                    id: getUniqueId2(),
                    image: image,
                }*/

                const data = await fetch(`https://api.pexels.com/v1/search?per_page=3&query=${image}`, {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: process.env.PEXELS_API_KEY,
                        },
                    })
                
                const ret = await data.json()

                //console.log('pexels', image, ret.photos)

                return {
                    id: getUniqueId2(),
                    key: image,
                    data: ret,
                }

            } catch(error) {
                
                console.log(error)

                return null

            }

        })
    )

    //const result = Date.now()

    console.log(result)

    return new Response(JSON.stringify({
        data: result,
    }), {
        status: 200,
    })

}

export async function GET(request) {

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    //console.log(query)

    /*client.photos.search({ query, per_page: 3 }).then((photos) => {
        console.log(photos)
    })*/

    const items = [
        {
            id: 10408337,
            width: 6000,
            height: 4000,
            url: 'https://www.pexels.com/photo/facade-of-former-hokkaido-government-office-in-japan-10408337/',
            photographer: 'Yuri Yuhara',
            photographer_url: 'https://www.pexels.com/@yurika',
            photographer_id: 676144,
            avg_color: '#726464',
            alt: 'Facade of Former Hokkaido Government Office in Japan'
        },
        {
            id: 12884934,
            width: 6016,
            height: 4000,
            url: 'https://www.pexels.com/photo/susukino-intersection-sapporo-japan-12884934/',
            photographer: 'SHIMADA MASAKI',
            photographer_url: 'https://www.pexels.com/@shimada-masaki-67885393',
            photographer_id: 67885393,
            avg_color: '#898A8C',
            alt: 'Susukino Intersection, Sapporo, Japan '
        },
        {
            id: 11759687,
            width: 3000,
            height: 4500,
            url: 'https://www.pexels.com/photo/people-at-the-tanukikoji-shopping-street-in-japan-11759687/',
            photographer: 'Alan Wang',
            photographer_url: 'https://www.pexels.com/@alan-wang-207740683',
            photographer_id: 207740683,
            avg_color: '#5B5A58',
            alt: 'People at the Tanukikoji Shopping Street in Japan'
        }
    ]

    return new Response(JSON.stringify({
        query,
        items,
        ia: Date.now(),
    }), {
        status: 200,
    })
}