import React from 'react'
import { Helmet } from 'react-helmet'
import { Toaster } from "react-hot-toast";
import Navbar from './Navbar';

const Layout = (props) => {
    return (
        <div>
            <Helmet>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="description" content={props.description} />
                <meta name="keywords" content={props.keywords} />
                <meta name="author" content={props.author} />
                <title>{props.title}</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Helmet>
            <Navbar />
            <main>
                <Toaster
                    position='top-center'
                    toastOptions={{
                        style: {
                            background: '#363636',
                            color: '#fff',
                            borderRadius: '8px',
                            padding: '16px 24px',
                        },
                        success: {
                            iconTheme: {
                                primary: '#4caf50',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#f44336',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                <div className="page-content">
                    {props.children}
                </div>
            </main>
        </div>
    )
}

export default Layout