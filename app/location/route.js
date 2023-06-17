import { textCompletion, chatCompletion } from '../../service/openai'

export async function POST(request) {

    const { location } = await request.json()
    
    if (!location) {
        return new Response('Bad question', {
            status: 400,
        })
    }

    console.log('location', location)

    let text = ''

    try {

        const prompt = `Check if the given Place is located within Hokkaido, Japan.\n` +
            `If the place is in Hokkaido, reply in Result with the given place.\n` +
            `If the place is not in Hokkaido, reply in Result with NOT-HOKKAIDO.\n` +
            `If the place is vague and generic name, reply in Result with such place located in Hokkaido.\n\n` +
            `Place:\n` +
            `${location}\n`
            `Result:`

        text = await textCompletion({
            prompt,
            temperature: 0.7,
            stop: ["Result:"]
        })

        console.log('result', text)

    } catch(error) {

        console.log(error)

    }

    return new Response(JSON.stringify({
        text,
    }), {
        status: 200,
    })

}