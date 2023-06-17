mytrip-hokkaido-app
======

A proof-of-concept Travel Planning app that allows users to create itinerary based on their interests using [OpenAI APIs](https://platform.openai.com/docs/introduction/overview).

The application is built using Next.js 13, powered by the OpenAI API, and supports Japanese language settings (日本語対応).

# Application

Type the location and activity you want to do anywhere in Hokkaido and the app will generate the itinerary. Similar previous plans will also be shown as suggestions.

![Search](./docs/screenshot1.png "Search")

Sample itinerary panel

![Sample itinerary](./docs/screenshot2.png "Sample itinerary")

Closing panel

![Closing panel](./docs/screenshot3.png "Closing panel")

# OpenAI APIs

The app uses several OpenAI APIs (Text Completion and Chat APIs).

* Extracting location and activity from user inquiry
* Checking whether the location is within Hokkaido
* Generating the itinerary based on submitted inquiry

# Images

To generate the images from the itinerary, I will be using another external API.
Initially, I was thinking of using [Bing Image Search API](https://www.microsoft.com/en-us/bing/apis/bing-image-search-api) but decided to [Pexels API](https://www.pexels.com/api/documentation/?language=javascript) for ease of use.

To help us to access `Pexels API`, I will be using their [Pexels Node.js library](https://github.com/pexels/pexels-javascript):

```sh
npm install pexels
```

I will be using `Pexels API` photo search function

```javascript
import { createClient } from "pexels"

const client = createClient(process.env.PEXELS_API_KEY)

client.photos.search({ query, per_page: 3 }).then((photos) => {
    console.log(photos)
})
```

# Thinking Out Loud

While we have shown that it is possible to generate itinerary on the fly using AI, I think solely relying on AI is not the way forward. 

It is still better to prepare such itineraries beforehand and use `Embedding API` to generate vector data that will be used for later. Another implementation is using external backend or function.

Since we cannot predict what the users will want, there will be cases where the database has no entry for such location/activity. This is where the AI can help to fill the gap.


# Setup

Clone the repository and install the dependencies

```sh
git clone https://github.com/supershaneski/mytrip-hokkaido-app.git myproject

cd myproject

npm install
```

Copy `.env.example` and rename it to `.env` then edit the `OPENAI_API_KEY` and `PEXELS_API_KEY` use your own API keys. 

```javascript
OPENAI_API_KEY=YOUR-OPENAI-API-KEY
PEXELS_API_KEY=YOUR-PEXELS-API-KEY
```

Then run the app

```sh
npm run dev
```

Open your browser to `http://localhost:4000/` to load the application page.
