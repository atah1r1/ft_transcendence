import '../styles/globals.css'
import type { AppProps } from 'next/app'
import React, { useEffect, useState } from 'react';
import axios from "axios"

type User = {
  avatar: string;
  createdAt: string;
  first_name: string;
  id: string;
  last_name: string;
  two_factor_auth: boolean;
  updateAt: string;
  username: string;
}

type GlobalContent = {
  data: User;
  loader: boolean;
}

export const UserContext = React.createContext<GlobalContent | undefined>( undefined );

export const UserProvider = ( props: { children: React.ReactNode } ) =>
{
  const [ loader, setLoader ] = useState( true );

  const [ data, setData ] = useState(
    {
      avatar: "https://cdn.intra.42.fr/users/yhadari.jpg",
      createdAt: "",
      first_name: "",
      id: "",
      last_name: "",
      two_factor_auth: false,
      updateAt: "",
      username: "",
    }
  );

  const fetchData = async () =>
  {
    try
    {
      const response = await axios.get(
        `${ process.env.NEXT_PUBLIC_BACKEND_URL }/user/me`,
        {
          withCredentials: true,
        }
      );
      setData( response.data );
    } catch ( error )
    {
      console.error( error );
    }
    finally
    {
      setLoader( false );
    }
  };

  useEffect( () =>
  {
    fetchData();
  }, [] );

  return <UserContext.Provider value={ { data, loader } }>{ props.children }</UserContext.Provider>
}

function MyApp ( { Component, pageProps }: AppProps )
{
  return <UserProvider>
    <Component { ...pageProps } />
  </UserProvider>
}

export default MyApp
