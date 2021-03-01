import { useState } from 'react';

const API_HOST=process.env.NEXT_PUBLIC_API_HOST
const PUBLICATION_PATH=process.env.NEXT_PUBLIC_PUBLICATION_PATH
const API_URL=`${API_HOST}${PUBLICATION_PATH}`

export default function CreatePublication () {
  
  const [image, setImage] = useState([])
  const [publisher, setPublisher] = useState('')
  const [title, setTitle] = useState('')
  const [account, setAccount] = useState('')

  function onImageChange (event) {
    console.log(event.target.files)
    setImage(event.target.files[0])
  }

  async function onSubmit (e) {
    e.preventDefault()

    const data = {
      publisher,
      title,
      account
    }

    const formData = new FormData()
    formData.append('data', JSON.stringify(data))
    formData.append('files.pdf_raw', image)
    console.log('Create publication - API_URL', API_URL)
    try {
      const res = await fetch(API_URL,
        {
          body: formData,
          //headers: {
          //  'Content-Type': 'multipart/form-data'
          //},
          method: 'POST'
        }
      )
      const result = await res.json()
      console.log(`Create publication - result: ${JSON.stringify(result)}`)
    } catch (err) {
      console.log('Err: ', err)
    }
  }

  return (
    <div>
      <h2>Publication</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="publisher">Publisher</label>
          <input name="publisher" type="text" value={publisher} onChange={e => setPublisher(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="title">Title</label>
          <input name="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="account">WMS Account</label>
          <input name="account" type="text" value={account} onChange={e => setAccount(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="raw_pdf">PDF filelabel</label>
          <input type="file" name="raw_pdf" onChange={onImageChange} alt="image" />
        </div>
        <button type="submit">Publish</button>
      </form>
    </div>
  )
}
