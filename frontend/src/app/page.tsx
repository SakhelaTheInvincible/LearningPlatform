"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from "react-hot-toast";
import AnimatedWrapper from "../components/layout/AnimatedWrapper";

export default function Home() {
  const [message, setMessage] = useState('Loading...')
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('http://localhost:8000/api/hello/')
      .then(response => {
        setMessage(response.data.message)
      })
      .catch(err => {
        setError(err.message)
      })
  }, [])

  return (
    <AnimatedWrapper>
      <h1>Fullstack App</h1>
      <p>Backend says: {message}</p>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </AnimatedWrapper>
  )
}