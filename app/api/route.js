import { chatCompletion } from '../../services/openai'

import { isEven } from '../../lib/utils'

export async function POST(request) {

    const { system, inquiry, previous } = await request.json()
    
    if (!system) {
        return new Response('Bad question', {
            status: 400,
        })
    }

    // Allow no inquiry: used in the beginning of Discussion
    /*if (!inquiry) {
        return new Response('Bad question', {
            status: 400,
        })
    }*/

    if (!Array.isArray(previous)) {
        return new Response('Bad chunks', {
            status: 400,
        })
    }

    let prev_data = previous

    /**
     * We need to manage the amount of previous data so that we don't hit
     * the maxtoken limit. Also sending large amount of data is costly.
     * Here, we are setting 20 entries as the cutoff.
     */

    const MAX_LENGTH = 20

    if(prev_data.length > MAX_LENGTH) {

        let cutoff = Math.ceil(previous.length - MAX_LENGTH)

        // we want to maintain the entries as pair of user and assistant prompts
        cutoff = isEven(cutoff) ? cutoff : cutoff + 1

        prev_data = previous.slice(cutoff)

    }

    let text = ''

    try {

        let messages = [
            { role: 'system', content: system },
        ]

        messages = messages.concat(prev_data)
        
        if(inquiry.length > 0) {
            messages.push({ role: 'user', content: inquiry })
        }

        text = await chatCompletion({
            messages,
            temperature: 0.7,
        })

    } catch(error) {

        console.log(error)

    }

    return new Response(JSON.stringify({
        text,
    }), {
        status: 200,
    })

}