import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router'
import useSWR from 'swr'
import PulseLoader from 'react-spinners/PulseLoader';
import { useAuth } from '../../context/auth';
import api from '../../lib/api';
import Layout from '../../components/Layout';
import NotificationPanel from '../../components/NotificationPanel';
import getIcon from '../../components/Icons';

const ROYALTY_STRUCTURE_PATH = process.env.NEXT_PUBLIC_ROYALTY_STRUCTURE_PATH;

// Icons
const IconArrowCircleDown = getIcon('arrowCircleDown');
const IconArrowCircleUp = getIcon('arrowCircleUp');
const IconTrash = getIcon('trash');

export default function RoyaltyStructure() {

  // Data fetching
  const { isReady } = useAuth();
  const router = useRouter();
  const pathId = router.query.id;
  const shouldFetch = isReady && pathId && pathId !== 'new';
  const { data:royaltyStructure, error } = useSWR(shouldFetch ? `${ROYALTY_STRUCTURE_PATH}/${pathId}` : null);

  // Royalty Structure state
  const [id, setId] = useState();
  const [name, setName] = useState('');
  const [wms_account, setWmsAccount] = useState('');
  const [payees, setPayees] = useState([]);

  // UI state
  const [selected, setSelected] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const blankAlias = useRef(null);
  
  // Update Royalty Structure state on data fetch
  useEffect(() => {
    if (royaltyStructure) {
      setId(royaltyStructure.id);
      setName(royaltyStructure.name);
      setWmsAccount(royaltyStructure.wms_account);
      setPayees(royaltyStructure.payees);
    }
  }, [royaltyStructure])

  // Focus on 'alias' field when adding a new payee
  useEffect(() => {
    if (blankAlias && blankAlias.current) blankAlias.current.focus();
  }, [payees])

  // Change property of payee
  function onChangePayeeProp(idx, prop, value) {
    const updatedPayees = [ ...payees ];
    updatedPayees[idx][prop] = value;
    setPayees(updatedPayees);
  }

  // Toggle selected payee
  function toggleSelected(idx) {
    const newSelected = idx !== selected ? idx : null;
    setSelected(newSelected);
  }

  // Add payee
  function addPayee() {
    const blankPayee = { alias: '', identifier: '', amount: '', denomination: '%' }
    const updatedPayees = [ ...payees, blankPayee];
    setPayees(updatedPayees);
    setSelected(updatedPayees.length - 1);
  }

  // Remove payee
  function removePayee(idx) {
    const updatedPayees = [ ...payees ];
    updatedPayees.splice(idx, 1);
    setPayees(updatedPayees);
  }

  // Handle form submission
  async function onSubmit (e) {
    e.preventDefault()
    setSaving(true);
   
    const isNew = !id;
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? ROYALTY_STRUCTURE_PATH : `${ROYALTY_STRUCTURE_PATH}/${id}`;
    const data = { id, name, wms_account, payees };

    try {
      const response = await api.request({ method, url, data });
      const savedRoyaltyStructure = response.data;
      setPayees(savedRoyaltyStructure.payees); // payee gets id after saving for the first time
      setSaving(false);
      setSaveSuccess(true);
      if (isNew) {
        setId(savedRoyaltyStructure.id);
        router.push(`/royalty-structure/${newId}`, undefined, { shallow: true })
      }
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 2000)
    }
  }

  function renderPayees(payees, selected) {
    return payees.map((payee, idx) => {
      const isLast = idx === payees.length - 1;
      const isBlank = !payee.alias && !payee.identifier && !payee.amount;
      const ref = (isLast && isBlank) ? blankAlias : null;
      const isSelected = idx === selected;
      const bgClass = isSelected ? 'bg-gray-200' : '';
      const Icon = isSelected ? IconArrowCircleDown : IconArrowCircleUp;
      return (
        <div key={idx}>
          <div className={`border-b flex text-gray-500 hover:text-gray-900 ${bgClass} hover:bg-gray-300 group px-3 py-3 text-left text-sm font-medium tracking-wider`}>
            <div className="flex-grow-0 cursor-pointer" onClick={() => toggleSelected(idx)}><Icon extraClasses="mr-4" /></div>
            <div className="flex-grow align-bottom pt-0.5">{payee.alias ? payee.alias : ''}</div>
            <div className="flex-grow-0 cursor-pointer" onClick={() => removePayee(idx)}><IconTrash /></div>
          </div>
          <div className={ `${isSelected ? '' : 'hidden'} bg-gray-100` } >
            <div className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
              <div className="flex flex-col space-y-4">
                <div>
                  <label htmlFor="alias" className="block text-sm font-medium text-gray-700">Alias</label>
                  <input 
                    ref={ ref}
                    type="text" 
                    name="alias" 
                    value={payee.alias} 
                    onChange={evt => onChangePayeeProp(idx, 'alias', evt.target.value)} 
                    required 
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                  />
                </div>
                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">Identifier</label>
                  <input 
                    type="text" 
                    name="identifier" 
                    value={payee.identifier}
                    onChange={evt => onChangePayeeProp(idx, 'identifier', evt.target.value)} 
                    required
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0">
                  <div className="flex-grow mr-0 sm:mr-2">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input 
                      type="text" 
                      name="amount" 
                      value={payee.amount}
                      onChange={evt => onChangePayeeProp(idx, 'amount', evt.target.value)} 
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                    />
                  </div>
                  <div className="flex-grow">
                    <label htmlFor="denomination" className="block text-sm font-medium text-gray-700">Denomination</label>
                    <input 
                      type="text" 
                      name="denomination" 
                      value={payee.denomination}
                      onChange={evt => onChangePayeeProp(idx, 'denomination', evt.target.value)} 
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    })
  }

  return (
    <Layout>
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none" tabIndex="0">
        <div className="py-6">
          <div className="max-w-7xl mx-auto mb-4 px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Royalty Structure</h1>
          </div>
          <NotificationPanel show={saveSuccess} bgColor="bg-green-100" message="Royalty Structure Saved!" />
          <NotificationPanel show={saveError} bgColor="bg-red-100" message="Error saving Royalty Structure!" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div id="new-publication-form" className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={onSubmit}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={name}
                        onChange={evt => setName(evt.target.value)}
                        required
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="wms_account" className="block text-sm font-medium text-gray-700">WMS Account</label>
                      <input 
                        type="text" 
                        name="wms_account"
                        value={wms_account}
                        onChange={evt => setWmsAccount(evt.target.value)} 
                        required
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">Payees</label>
                      <div className="flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                              <div className="min-w-full">
                                  { renderPayees(payees || [], selected) }
                                  <div className="bg-white text-center">
                                    <div>
                                      <button type="button" onClick={addPayee} className="h-10 my-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-300 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Add Payee
                                      </button>
                                    </div>
                                  </div>
                              </div>
                            </div>
                          </div>
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
  );
}
