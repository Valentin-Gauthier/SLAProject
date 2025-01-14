import React, { useState } from 'react'

const Search = () => {


  {/* Search Bar Data */}
  const [search, setSearch] = useState("")

  function handleSearchChange(event){
    setSearch(event.target.value)
    console.log(search)
  }

  function getSearch(){
    return search 
  }
  
  return (
    <div className='relative w-full text-gray-600'>
        <input
            type={'search'}
            name={'search'}
            placeholder={'Rechercher un patient...'}
            className='bg-white h-10 px-5 pr-10 w-full rounded-full text-sm focus:outline-none'
            onChange={handleSearchChange}
        />

    </div>
  )
}

export default Search