import React, { FC } from 'react';
import { Link } from 'react-router-dom'
import { AiOutlineSend } from "react-icons/ai";
import { useState, useEffect } from 'react'

const Login: FC<any> = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
      })
    const { email, password } = formData
    const onSubmit = () => {

    }
    const onChange = (e: any) => {
        setFormData((prevState) => ({
          ...prevState,
          [e.target.name]: e.target.value,
        }))
      }
    return (
        <>
        <section className='heading'>
            <h1>
            <AiOutlineSend /> Login
            </h1>
            <p>Please log in to get support</p>
        </section>

        <section className='form'>
            <form onSubmit={onSubmit}>
            <div className='form-group'>
                <input
                type='email'
                className='form-control'
                id='email'
                name='email'
                value={email}
                onChange={onChange}
                placeholder='Enter your email'
                required
                />
            </div>
            <div className='form-group'>
                <input
                type='password'
                className='form-control'
                id='password'
                name='password'
                value={password}
                onChange={onChange}
                placeholder='Enter password'
                required
                />
            </div>
            <div className='form-group'>
                <button className='btn btn-block'>Submit</button>
            </div>
            </form>
        </section>
        </>
  )
};

export default Login;