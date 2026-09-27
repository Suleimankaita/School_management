import React,{useEffect,useState} from 'react'

    const arr=[
        {
            id:1,
            name:"suleiman",
        },
        {
            id:2,
            name:"yusuf",
        },
        {
            id:3,
            name:"kaita",
        },
        {
            id:4,
            name:"man",
        },
    ]

const S = () => {

    const [all,setall]=useState([])
    

    useEffect(()=>{

        const timer=arr.map((res,_)=>{
            return  setTimeout(() => {
                setall(prev=>[...prev,res])
            }, _*100);
        })


        return ()=>timer.forEach(clearTimeout)

    },[])



  return (
    <div className='w-full min-h-screen bg-slate-50'>
        
        <div className="flex justify-evenly top-4 relative ">

        {
            all.map(res=>(
                <div key={res.id} className="w-2xs flex-col justify-center items-center  h-28 rounded-2xl shadow-2xl ">

                <h1 >{res.name}</h1>
                <h1 >{res.name}</h1>
                </div>
            ))
        }
        </div>
    </div>
  )
}

export default S
