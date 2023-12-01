export const getSimpleId = () => {
    return Math.random().toString(26).slice(2);
}

export const getUniqueId = () => {
    return (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2);
}

export function getUniqueId2() {
	return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}

export const getDataId = () => {
    return Date.now() + Math.random().toString(36).slice(2)
}

export const isEven = (n) => {
    return n % 2 == 0;
}

export const trim_array = ( arr, max_length = 20 ) => {

  let new_arr = arr
  
  if(arr.length > max_length) {
      
      let cutoff = Math.ceil(arr.length - max_length)
      cutoff = isEven(cutoff) ? cutoff : cutoff + 1
      
      new_arr = arr.slice(cutoff)

  }

  return new_arr

}
export const sleep = (delay) => {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export const copyToClipboard = (data) => {

  try {

    const clipboardItem = new ClipboardItem({
      'text/plain': new Blob([data], { type: 'text/plain' }),
    })

    navigator.clipboard.write([clipboardItem]).then(() => {
        console.log('copy to clipboard success')
      }, () => {
        console.log('copy to clipboard failed')
      })

  } catch(error) {
    console.log(error)
  }

}

function datePassed(date) {

  let today = new Date();
  let oldDate = new Date(date);

  let difference = today.getTime() - oldDate.getTime();

  difference = difference/ 1000;
  difference = difference / 60;
  difference = difference / 60;
  difference = difference / 24;

  let days = Math.floor(difference);
  difference = difference - days;
  difference = difference * 24;
  let hours = Math.floor(difference);
  difference = difference - hours;
  difference = difference * 60;
  let minutes = Math.floor(difference);
  difference = difference - minutes;
  difference = difference * 60;
  let seconds = Math.floor(difference);

  return {
    days,
    hours,
    minutes,
    seconds,
  }

};

export const getDateDiff = (date) => {

  const ret = datePassed(date)

  if(ret.days > 0) {

    return ret.days > 1 ? `${ret.days} days ago` : 'yesterday'

  } else {

    if(ret.hours > 0) {

      return ret.hours > 1 ? `${ret.hours} hours ago` : 'an hour ago'

    } else {

      if(ret.minutes > 0) {

        return ret.minutes > 1 ? `${ret.minutes} minutes ago` : 'a minute ago'

      } else {

        return 'just now'

      }

    }

  }

}

export const formatNumber = (n) => n < 10 ? '0' + n : n

export const getTimeDiff = (time) => {
  
  const delta = Math.round((Date.now() - time) / 1000)

  let minutes = Math.floor(delta / 60)
  let seconds = delta - (minutes * 60)

  minutes = formatNumber(minutes)
  seconds = formatNumber(seconds)

  return [minutes, seconds].join(':')

}

function DateDiffInDays(dt1, dt2) {
  return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24))
}

export function getDateDiff2(sdate) {

  const odate = new Date(sdate)
  
  var today = new Date()
  var days = DateDiffInDays(odate, today)

  if(days > 0) {

    if(days < 30) {
      return days > 1 ? `${days} days ago` : `yesterday`
    } else {
      return ''
    }

  } else {

    var hour1 = parseInt(today.getHours())
    var hour2 = parseInt(odate.getHours())
    var min1 = parseInt(today.getMinutes())
    var min2 = parseInt(odate.getMinutes())
      
    hour1 += min1/60
    hour2 += min2/60

    var delta_hour = hour1 - hour2
    var hours = Math.floor(delta_hour)

    if(hours > 0) {

      return hours > 1 ? `${hours} hours ago` : `an hour ago`

    } else {
        
      var minutes = Math.round(delta_hour * 60)

      if(minutes > 0) {

        return minutes > 1 ? `${minutes} mins ago` : `a min ago`

      } else {

        return 'just now'

      }

    }

  }

}

const getMonthName = (n) => (["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"])[n]

export const getDateTime = (dateTime) => {
    const date = new Date(dateTime)
    const syear = date.getFullYear()
    let smonth = date.getMonth()// + 1
    let sdate = date.getDate()
    let shour = date.getHours()
    let sminute = date.getMinutes()
    let seconds = date.getSeconds()
    //smonth = formatNumber(smonth)
    sdate = formatNumber(sdate)
    shour = formatNumber(shour)
    sminute = formatNumber(sminute)
    seconds = formatNumber(seconds)
    //return [[syear, smonth, sdate].join('-'), [shour, sminute].join(':')].join(' ')
    return [[[getMonthName(smonth), sdate].join(' '),syear].join(', '), [shour, sminute].join(':')].join(' ')
}

export const formatMessage = (strData) => {
  const tokens = strData.split('\n')
  let strArray = []
  let flag = false
  for(let i = 0; i < tokens.length; i++) {
    if(tokens[i].indexOf('Response:') >= 0) {
      strArray.push(tokens[i].replace('Response:', ''))
      flag = true
    } else {
      if(flag) {
        strArray.push(tokens[i])
      }
    }
  }

  if(!flag && strArray.length === 0) {

    let token = tokens.filter((str) => str.indexOf('Customer-Sentiment:') < 0 && str.length > 0)

    return token.join('\n').replace('SESSION-ENDED', '')
  }

  return strArray.join('\n').replace('SESSION-ENDED', '')
}

export const formatPrice = (price) => {
  if(isNaN(price)) return '---'
  const int_price = parseInt(price)
  return `${int_price.toLocaleString('en-US', { style: 'currency', currency: 'JPY' })}`
}

// ReferenceURL: https://github.com/openai/openai-cookbook/tree/main/apps/file-q-and-a/nextjs

export const MAX_BATCH_SIZE = 20
export const MAX_NUM_FILES = 3
export const MAX_FILE_SIZE_MB = 2
export const MAX_CHAR_LENGTH = 250 * 4
export const COSINE_SIM_THRESHOLD = 0.72
export const MAX_FILES_LENGTH = 2000 * 3

// A function that splits a text into smaller pieces of roughly equal length
// The pieces are delimited by sentences and try to avoid breaking words or punctuation
// This can be useful for processing long texts with natural language models that have a limited input size
export function chunkText({
    text, // The input text to be split
    // The desired maximum length of each piece in characters
    // This uses 4 characters as an approximation of the average token length
    // since there isn't a good JS tokenizer at the moment
    maxCharLength = 250 * 4,
  }) {
    
    // Create an empty array to store the pieces
    const chunks = [];
  
    // Create a variable to hold the current piece
    let currentChunk = "";
  
    // Remove any newline characters from the text and split it by periods
    // This assumes that periods mark the end of sentences, which may not be true for some languages
    const sentences = text.replace(/\n/g, " ").split(/([.])/);
  
    for (const sentence of sentences) {
      // Remove any extra whitespace from the beginning and end of the sentence
      const trimmedSentence = sentence.trim();
  
      // If the sentence is empty, skip it
      if (!trimmedSentence) continue;
  
      // Check if adding the sentence to the current piece would make it too long, too short, or just right
      // This uses a tolerance range of 50% of the maximum length to allow some flexibility
      // If the piece is too long, save it and start a new one
      // If the piece is too short, add the sentence and continue
      // If the piece is just right, save it and start a new one
      const chunkLength = currentChunk.length + trimmedSentence.length + 1;
      const lowerBound = maxCharLength - maxCharLength * 0.5;
      const upperBound = maxCharLength + maxCharLength * 0.5;
  
      if (
        chunkLength >= lowerBound &&
        chunkLength <= upperBound &&
        currentChunk
      ) {
        // The piece is just right, so we save it and start a new one
        // We remove any periods or spaces from the beginning of the piece and trim any whitespace
        currentChunk = currentChunk.replace(/^[. ]+/, "").trim();
        // We only push the piece if it is not empty
        if (currentChunk) chunks.push(currentChunk);
        // Reset the current piece
        currentChunk = "";
      } else if (chunkLength > upperBound) {
        // The piece is too long, so save it and start a new one with the sentence
        // Remove any periods or spaces from the beginning of the piece and trim any whitespace
        currentChunk = currentChunk.replace(/^[. ]+/, "").trim();
        // We only push the piece if it is not empty
        if (currentChunk) chunks.push(currentChunk);
        // Set the current piece to the sentence
        currentChunk = trimmedSentence;
      } else {
        // The piece is too short, so add the sentence and continue
        // Add a space before the sentence unless it is a period
        currentChunk += `${trimmedSentence === "." ? "" : " "}${trimmedSentence}`;
      }
    }
  
    // If there is any remaining piece, save it
    if (currentChunk) {
      chunks.push(currentChunk);
    }
  
    // Return the array of pieces
    return chunks;
}
