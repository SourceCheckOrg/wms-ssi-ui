import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import useSWR from 'swr'
import PulseLoader from 'react-spinners/PulseLoader';
import { useAuth } from '../../context/auth';
import api from '../../lib/api';
import Protected from '../../components/Protected';
import Layout from '../../components/AppLayout';
import NotificationPanel from '../../components/NotificationPanel';
import SelectField from '../../components/SelectField';

const PUBLICATION_PATH=process.env.NEXT_PUBLIC_PUBLICATION_PATH
const ROYALTY_STRUCTURE_PATH = process.env.NEXT_PUBLIC_ROYALTY_STRUCTURE_PATH;

export default function Publication() {
  
  // Data fetching
  const { isReady } = useAuth();
  const router = useRouter();
  const pathId = router.query.id;
  const shouldFetchPublication = isReady && pathId && pathId !== 'new';
  const { data: royaltyStructures, error: rsError} = useSWR(isReady ? ROYALTY_STRUCTURE_PATH : null);
  const { data: publication, error: pubError } = useSWR(shouldFetchPublication ? `${PUBLICATION_PATH}/${pathId}` : null);

  // Publication state
  const [id, setId] = useState();
  const [pdfRaw, setPdfRaw] = useState([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [royalty_structure, setRoyaltyStructure] = useState(null);
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Update Publication state on data fetch
  useEffect(() => {
    if (publication) {
      setId(publication.id);
      setTitle(publication.title);
      setSlug(publication.slug);
      setRoyaltyStructure(publication.royalty_structure ? publication.royalty_structure.id : null);
    }
  }, [publication])

  // Handle file upload
  function onFileUpload (event) {
    setPdfRaw(event.target.files[0]);
  }

  // Handle form submission
  async function onSubmit (e) {
    e.preventDefault();
    setSaving(true);

    const isNew = !id;
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? PUBLICATION_PATH : `${PUBLICATION_PATH}/${id}`;
    const data = { id, title, slug, royalty_structure };

    // Request data and headers
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    formData.append('files.pdf_raw', pdfRaw);
    const headers = { 'Content-Type': 'multipart/form-data' };

    try {
      const response = await api.request({ method, url, data: formData, headers });
      const savedPublication = response.data;
      setSaving(false);
      setSaveSuccess(true);
      if (isNew) {
        const newId = savedPublication.id;
        setId(newId);
        router.push(`/publication/${newId}`, undefined, { shallow: true });
      }
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 2000);
    }
  }

  return (
    <Protected>
      <Layout>
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none" tabIndex="0">
        <div className="py-6">
          <div className="max-w-7xl mx-auto mb-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Publication</h1>
          </div>
          <NotificationPanel show={saveSuccess} bgColor="bg-green-100" message="Publication Saved!" />
          <NotificationPanel show={saveError} bgColor="bg-red-100" message="Error saving Publication!" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div id="new-publication-form" className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={onSubmit}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                      <input 
                        type="text" 
                        name="title" 
                        value={title} 
                        onChange={evt => setTitle(evt.target.value)}
                        required
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
                      <input 
                        type="text" 
                        name="slug" 
                        value={slug} 
                        onChange={evt => setSlug(evt.target.value)}
                        required
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-3">
                      <label htmlFor="royalty-structure" className="block text-sm font-medium text-gray-700">Royalty Structure</label>
                      <SelectField 
                        options={royaltyStructures}
                        valueField="id" 
                        labelField="name" 
                        selected={royalty_structure ? royalty_structure : null} 
                        onChange={value => setRoyaltyStructure(value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PDF</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="raw_pdf" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                              <span>Upload a file</span>
                              <input id="raw_pdf" name="raw_pdf" type="file" className="sr-only" onChange={onFileUpload}/>
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF up to 30MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  { saving ? (
                        <div className="inline-block text-center py-2 px-2 border border-transparent shadow-sm rounded-md h-10 w-20 bg-indigo-600 hover:bg-indigo-700">
                          <PulseLoader color="white" loading={saving} size={9} /> 
                        </div>
                      ) : (
                        <button type="submit" className="h-10 w-20 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Save
                        </button>
                      ) 
                    }
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </Layout>
    </Protected>
  );
}
