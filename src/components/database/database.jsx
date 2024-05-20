import React, { useState } from "react";

import axios from "axios";

const Database = () => {
  const [itemToAdd, setItemToAdd] = useState("");
  const [sizeToAdd, setSizeToAdd] = useState("XS");
  const [shoeSizeToAdd, setShoeSizeToAdd] = useState("36");
  const [countToAdd, setCountToAdd] = useState(1);
  const [Location, setLocation] = useState("");
  const [color,setColor] = useState("");
  const [coords, setCoords] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Imbracaminte");



  const createChangeHandler = (setStateFunction) => (event) => {
    setStateFunction(event.target.value);
  };
  
  const handleItemToAddChange = createChangeHandler(setItemToAdd);
  const handleCountToAddChange = createChangeHandler(setCountToAdd);
  const handleCategoryChange = createChangeHandler(setSelectedCategory);
  const handleSizeChange = createChangeHandler(setSizeToAdd);
  const handleShoeSizeChange = createChangeHandler(setShoeSizeToAdd);
  const handleLocation = createChangeHandler(setLocation);
  const handleColor = createChangeHandler(setColor);
  const handleCoords = createChangeHandler(setCoords);


  const renderSizeOptions = () => { 
    if (selectedCategory === "Imbracaminte") {
      return (
        <select id="sizes" value={sizeToAdd} onChange={handleSizeChange} className='select'>
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="SM">SM</option>
          <option value="M">M</option>
          <option value="ML">ML</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
        </select>
      );
    } else if (selectedCategory === "Incaltaminte") {
      return (
        <select
          id="shoe-sizes"
          value={shoeSizeToAdd}
          onChange={handleShoeSizeChange}
          className='select'
        >
          <option value="36" defaultValue>
            36
          </option>
          <option value="37">37</option>
          <option value="38">38</option>
          <option value="39">39</option>
          <option value="40">40</option>
          <option value="41">41</option>
          <option value="42">42</option>
          <option value="43">43</option>
        </select>
      );
    } else {
      return null;
    }
  };

  const handleAddItem = () => {
    if (!itemToAdd || !color || !Location) {
      alert("Fields cannot be empty!!");
      return;
    }
    if(countToAdd === 0){
      alert("Can not add 0 items!")
    }

    let requestData = {
      details: JSON.stringify({
        locatie: Location,
        category: selectedCategory,
        color: color,
        count: countToAdd,
        size: selectedCategory === "Imbracaminte" ? sizeToAdd : shoeSizeToAdd,
      }),
    };

    console.log("Request Data:", requestData);
    // Make the API request only if itemToAdd is not empty
    axios.post(`/api/${Location}/${itemToAdd}`, requestData).then(() => {
      setItemToAdd("");
      setCountToAdd(1);
      setLocation("");
      setColor("");
    });

  };
  const handleAddLocation = () => {
    // Check if the location already exists
    axios.get(`/api/locatii/${Location}`)
      .then((response) => {
        const existingCoords = response.data[Location]?.coords;
  
        if (existingCoords) {
          alert(`Location '${Location}' already exists with coordinates ${existingCoords}`);
        } else {
          // If the location doesn't exist, proceed with adding it
          // Ensure that the coords are in the format "10,10"
          const formattedCoords = coords.split(',').map(coord => coord.trim()).join(', ');
          let requestLocationData = {
            details: JSON.stringify({
              coords: formattedCoords,
            }),
          };
  
          axios.post(`/api/locatii/${Location}`, requestLocationData)
            .then(() => {
              setCoords("");
              alert(`Location '${Location}' added successfully with coordinates ${formattedCoords}`);
            })
            .catch((error) => {
              console.error("Error adding location:", error);
              alert("Error adding location. Please try again.");
            });
        }
      })
      .catch((error) => {
        console.error("Error checking location:", error);
        alert("Error checking location. Please try again.");
      });
  };


  return (
    

    <div className='container'>
      <div className="wrapper ">
        <div className='add_input'>
          <input
            className='input'
            type="text"
            value={Location}
            onChange={handleLocation}
            placeholder="Locatie"
          />
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className='select'
          >
            <option value="Imbracaminte">Imbracaminte</option>
            <option value="Incaltaminte">Incaltaminte</option>
          </select>
          {renderSizeOptions()}
          <input
            className='input'
            type="text"
            value={itemToAdd}
            onChange={handleItemToAddChange}
            placeholder="Numele produsului"
          />
          <input
            className='input'
            type="text"
            value={color}
            onChange={handleColor}
            placeholder="Culoarea produsului"
          />
          <input
            className='input'
            type="number"

            value={countToAdd <= 0 ? 1 : countToAdd}
            onChange={handleCountToAddChange}
            placeholder="Cantitate"
          />
          <button className='button' onClick={handleAddItem}>
            Add Item
          </button>
          <input
            className='input'
            type="text"
            value={coords}
            onChange={handleCoords}
            placeholder="Coords for a new Location"
          />
          <button className='button' onClick={handleAddLocation}>
            Add Location
          </button>
        </div>
        <div className="logo-container "></div>
      </div>
    </div>
  );
};

export default Database;
