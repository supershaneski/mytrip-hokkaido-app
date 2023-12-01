import * as openai from '../../service/openai'
import { trim_array } from '../../lib/utils'

import get_place_function from '../../tools/get_place.json'
import output_schema from '../../tools/output_schema.json'

const wait = (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay))
}

export async function POST(request) {

    const { inquiry, previous } = await request.json()
    
    if (!inquiry || !Array.isArray(previous)) {
        return new Response('Bad request', {
            status: 400,
        })
    }

    const flag = true

    if(flag) {

        await wait(500)

        return new Response('Bad request', {
            status: 400,
        })
    }

    const context = trim_array(previous)
    
    const APP_PLACE_NAME = process.env.APP_LOCATION //'Hokkaido, Japan'

    // rewrite function description
    get_place_function.description = `Extract name of place and theme or activity for the trip in the given texts and check if it is located in ${APP_PLACE_NAME}.`
    get_place_function.parameters.properties.isLocationValid.description = `Flag that tells whether the place is located in ${APP_PLACE_NAME} or not`

    let system_prompt = `You are a helpful travel planner specializing in ${APP_PLACE_NAME}.\n` +
        `Since this is a regional travel app targeted for ${APP_PLACE_NAME}, call get_place function to verify the location is indeed in ${APP_PLACE_NAME}.`
        
    let output = {}

    try {

        let messages = [{ role: 'system', content: system_prompt }]
        if(context.length > 0) {
            messages = messages.concat(context)
        }
        messages.push({ role: 'user', content: inquiry })

        let response = await openai.chat({
            messages,
            tools: [
                { type: 'function', function: get_place_function },
            ]
        })

        console.log('function call', response)

        if(response.finish_reason !== 'tool_calls') {

            return new Response(JSON.stringify({
                status: 'error',
                text: response.message.content,
                output,
            }), {
                status: 200,
            })

        }

        const tmp_tool_item = response.message.tool_calls[0]
        const tmp_tool_item_arg = JSON.parse(tmp_tool_item.function.arguments)

        const target_activity = tmp_tool_item_arg.itinerary
        const target_place = tmp_tool_item_arg.place

        console.log(tmp_tool_item_arg)

        if(!tmp_tool_item_arg.isLocationValid) {

            return new Response(JSON.stringify({
                status: 'error',
                text: 'invalid place',
                output,
            }), {
                status: 200,
            })

        }

        system_prompt = `You are a helpful travel planner specializing in ${APP_PLACE_NAME} and designed to output json.\n` +
            `Your output is to an API.\n` +
            `Create valid json complying to the schema.\n\n` +
            `Today is ${new Date()}.\n\n` +
            `# json output schema\n` +
            JSON.stringify(output_schema, null, 2)

        const query = context.length > 0 ? [target_activity, target_place].join(', ') : inquiry

        messages = []
        messages.push({ role: 'system', content: system_prompt })
        messages.push({ role: 'user', content: query })

       response = await openai.chat({
            response_format: { type: "json_object" },
            messages
        })

        console.log(response.message.content)

        output = response.message.content

    } catch(error) {
        
        console.log(error.name, error.message)

    }

    return new Response(JSON.stringify({
        status: 'ok',
        text: '',
        output,
    }), {
        status: 200,
    })

}