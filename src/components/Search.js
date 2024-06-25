import React from "react";

const Search = () =>{

    return(
        <header>
            <h2 className="header__title"> 
                Search it. Explore it. Buy it.
            </h2>

            <input type="text"
            className="header__search"
            placeholder="Enter an address, city, or Zip code"/>
        </header>
    );
}

export default Search;