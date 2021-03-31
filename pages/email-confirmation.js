import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import { useRouter } from 'next/router'
import Cookie from 'js-cookie';
import QRCode from 'qrcode.react';
import socketIoClient from 'socket.io-client';
import NavBar from '../components/NavBar'

const API_HOST=process.env.NEXT_PUBLIC_API_HOST;
const SSI_SIGNUP_PATH=process.env.NEXT_PUBLIC_SSI_SIGNUP_PATH;
const SSI_SIGNUP_URL=`${API_HOST}${SSI_SIGNUP_PATH}`;

export default function EmailConfirmation() {
  const [socket, setSocket] = useState()
  const [token, setToken] = useState()
  const router = useRouter();
  
  const { confirmation } = router.query;
  if (confirmation && confirmation !== token) {
    setToken(confirmation);
  }

  // Create socket on component mount
  useEffect(() => {
    let newSocket = socketIoClient(API_HOST);
    
    newSocket.on('hello', data => {
      console.log('received hello server: ', data)
    });

    newSocket.on('jwt', jwt => {
      Cookie.set('token', jwt);
      Router.push('/');
    });

    // TODO handle sign-up errors (like problems with VP)

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, []);

  // Listen to events related to client token
  useEffect(() => {
    if (token) {
      socket.emit('client-token-sub', token);
    }
  }, [token]);

  const url = `${SSI_SIGNUP_URL}?confirmationToken=${confirmation}`;
  
  return (
    <>
      <NavBar />
      <div className="max-w-7xl px-5 mt-5 mx-auto">
      <div className="mt-10 sm:mt-0">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1 px-3">
              <div className="px-4 sm:px-0">
                <h3 className="text-xl font-medium leading-6 text-gray-900">Email confirmation</h3>
                <p className="mt-1 text-sm text-gray-600">Please scan the QR code using your credible Wallet to finish Sign Up</p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2 px-7" >
              <QRCode
                id={confirmation}
                value={url}
                size={200}
                level={'H'}
                includeMargin={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
