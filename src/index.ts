import fs from 'fs'
import * as core from '@actions/core'
import bent from 'bent'
import FormData from 'form-data'


const getJson = bent('json')

const sleep = async (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000))

const main = async () => {
  try {
    const token = core.getInput('token', { required: true })
    const bookId = core.getInput('book-id', { required: true })
    const zip = core.getInput('zip', { required: true })
    const domain = core.getInput('domain', { required: false })
    const changelog = core.getInput('changelog', { required: false })

    const authHeaders = {
      'Authorization': 'Bearer ' + token
    }

    const api = bent(`https://octopus.${domain}`, 'POST', 'json', 200)

    const postData = new FormData();
    postData.append('changelog', changelog);
    postData.append('archive', fs.createReadStream(zip),  {
      knownLength: fs.statSync(zip).size
    })
    console.log('API call')
    const headers = Object.assign(postData.getHeaders(), authHeaders)
    headers['Content-Length'] = await postData.getLengthSync()
    const res = await api(`/api/v1/books/${bookId}/versions`,
      postData, headers);
    const taskUrl = res['taskUri']
    if (!taskUrl) {
      throw new Error('task Url not found')
    }
    console.log(`taskUrl ${taskUrl}`)
    for (let i = 0; i < 100; i++) { // 100 checks attempt
      await sleep(10)
      const status = await getJson(taskUrl, undefined, authHeaders)
      if (status['done']) {
        if (status['error']) {
          throw new Error(status['error'])
        }
        break
      }

    }
    console.log('publish Completed')
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()