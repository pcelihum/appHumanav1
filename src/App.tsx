import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {


  return (
    <>

      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
        <Title/>
      <div className="card">
       
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>


    </>
  )
}

function Title() {
    const [lastName, setLastName] = useState("Smith")
    const [count, setCount] = useState(0)
  
    useEffect(()=>{
       console.log('Hello') 
    },[])
    
    const nameUser = "Patricio Celi"
    
    
    return <>
    <h1> Hello Im <NameUser name={nameUser} lastName={lastName}/> </h1>
        <button onClick={() => setLastName('Patricio Celi')}> Change lastname</button>
        <button onClick={() => setCount((count)=> count + 1)}>
            count is {count}
        </button>
        
    </>
}

function NameUser(props: { name: string, lastName: string  }) {
    

    return <>
        <span>{props.name} {props.lastName} </span>
        
    </>
}




export default App
