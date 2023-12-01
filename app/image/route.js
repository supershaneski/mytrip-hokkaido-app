//import { createClient } from 'pexels'

import { getUniqueId2 } from '../../lib/utils'

//const client = createClient(process.env.PEXELS_API_KEY)

export async function POST(request) {

    const { images } = await request.json()
    
    if (!Array.isArray(images)) {
        return new Response('Bad chunks', {
            status: 400,
        })
    }

    const result = await Promise.all(
        Array.from(images).map(async (image) => {

            try {

                const search_key = image.split("_").join("%20")

                const data = await fetch(`https://api.pexels.com/v1/search?per_page=3&query=${search_key}`, {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: process.env.PEXELS_API_KEY,
                        },
                    })
                
                const ret = await data.json()

                console.log(image, ret)

                return {
                    id: getUniqueId2(),
                    key: image,
                    data: ret,
                }

            } catch(error) {
                
                console.log(image, error.name, error.messages)

                return null

            }

        })
    )

    return new Response(JSON.stringify({
        data: result,
    }), {
        status: 200,
    })

}