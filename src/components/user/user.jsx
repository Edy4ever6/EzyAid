
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function User() {
  const [cnp, setCnp] = useState("");
  const [user, setUser] = useState("");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const cnpStatusRef = useRef(null);
  const [cnpDetails, setCnpDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch item data from all locations
        const response = await axios.get('/locatii'); // Adjust your Flask API endpoint
        const itemsData = response.data;
  
        // Assuming itemsData is an object with keys representing locations
        // Extracting items from all locations
        const allItems = Object.values(itemsData)
          .flatMap(location => location.items || []);
  
        setItems(allItems || []);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
  
    fetchData();
  }, []);

  const createChangeHandler = (setStateFunction) => (event) => {
    setStateFunction(event.target.value);
  };

  const handleUserChange = createChangeHandler(setUser);

  const handleItemChange = (event) => {
    const selected = event.target.value;
    setSelectedItem(selected);
  };

  const handleCnpChange = (event) => {
    const result = event.target.value.replace(/\D/g, "");
    if (result.length <= 13) {
      setCnp(result);
    }
  };

  const validateCNP = () => {
    if (cnp.length !== 13) {
      return false;
    }

    // CNP validation logic
    const cnpDigits = cnp.split("").map(Number);
    const controlKey = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      sum += cnpDigits[i] * controlKey[i];
    }
    
    const remainder = sum % 11;
    const validControlKey = remainder === 10 ? 1 : remainder;
    if (validControlKey !== cnpDigits[12]) {
      return false;
    }

    // Extract location, date, and sex
    const judetArray = [
      "Alba",
      "Arad",
      "Arges",
      "Bacau",
      "Bihor",
      "Bistrita-Nasaud",
      "Botosani",
      "Brasov",
      "Braila",
      "Buzau",
      "Caras-Severin",
      "Cluj",
      "Constanta",
      "Covasna",
      "Dambovita",
      "Dolj",
      "Galati",
      "Gorj",
      "Harghita",
      "Hunedoara",
      "Ialomita",
      "Iasi",
      "Ilfov",
      "Maramures",
      "Mehedinti",
      "Mures",
      "Neamt",
      "Olt",
      "Prahova",
      "Satu Mare",
      "Salaj",
      "Sibiu",
      "Suceava",
      "Teleorman",
      "Timis",
      "Tulcea",
      "Vaslui",
      "Valcea",
      "Vrancea",
      "Bucuresti",
      "Bucuresti S1",
      "Bucuresti S2",
      "Bucuresti S3",
      "Bucuresti S4",
      "Bucuresti S5",
      "Bucuresti S6",
      "Calarasi",
      "Giurgiu",
    ];

    const judet = 10 * cnpDigits[7] + cnpDigits[8];
    const location = judetArray[judet - 1];
    let an, luna, zi;
    an = 10 * cnpDigits[1] + cnpDigits[2];
    
    if (cnpDigits[0] < 3) {
      an += 1900;
    } else if (cnpDigits[0] < 5) {
      an += 1800;
    } else if (cnpDigits[0] < 7) {
      an += 2000;
    } else {
      an += 1900;
    }
    
    luna = 10 * cnpDigits[3] + cnpDigits[4];
    
    zi = 10 * cnpDigits[5] + cnpDigits[6];

    const dateOfBirth = `${zi}.${luna}.${an}`;
    const sex = cnpDigits[0] % 2 === 0 ? "Feminin" : "Masculin";

    //Cases
    if(sum===0)return false;
    if(location == null)return false;
    if(luna>12)return false;
    setCnpDetails({ location, dateOfBirth, sex });
    return true;
  };
  useEffect(() => {
    // Check CNP length and update details if it has 13 characters
    if (cnp.length === 13) {
      const isValidCNP = validateCNP();

      if (isValidCNP) {
        // Display CNP details based on the current input
        const details = cnpDetails
          ? `CNP status: Valid<br />Data nasterii: ${cnpDetails.dateOfBirth}<br />Locatia nasterii: ${cnpDetails.location}<br />Sex: ${cnpDetails.sex}`
          : "";

        // Use ref to access the element
        if (cnpStatusRef.current) {
          cnpStatusRef.current.innerHTML = details;
        }
      } else {
        // Display CNP is invalid
        if (cnpStatusRef.current) {
          cnpStatusRef.current.innerHTML = "CNP status: Invalid";
        }
      }
    } else {
      // Display a message when CNP length is not 13
      if (cnpStatusRef.current) {
        cnpStatusRef.current.innerHTML =
          "CNP status: Invalid (not 13 characters)";
      }
    }
  },);
  const addData = () => {
    if (!cnp || !user) {
      alert("Fields not completed.");
      return;
    }

    if (!validateCNP()) {
      return;
    }

    const data = {
      details: JSON.stringify({
        namele: user,
        CNP: cnp,
      }),
    };

    axios
      .post(`/api/add/${user}/${cnp}`, data)
      .then(() => {
        setCnp("");
        setUser("");
        setCnpDetails(null);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          alert(" CNP already exists.");
        } else {
          console.error("Error adding data:", error);
          alert("Error adding data. Please try again later.");
        }
      });
  };

  return (
    <div className="container ">
      <div className="wrapper ">
        <div className="add_input">
          <div ref={cnpStatusRef} className="cnp-status">
            <p>CNP staus: </p>
            <p>Data nasterii:</p>
            <p>Sex: </p>
            <p>Locatia nasterii: </p>
          </div>
          <input
            className="input"
            type="text"
            value={user}
            onChange={handleUserChange}
            placeholder="Numele si prenumele"
          />
          <input
            className="input"
            type="text"
            value={cnp}
            onChange={handleCnpChange}
            placeholder="CNP"
          />
          <select
            className="select"
            value={selectedItem}
            onChange={handleItemChange}
          >
            <option value="">Select Item</option>
            {items.map((itemObject) => (
              <option key={itemObject.item} value={itemObject.item}>
                {itemObject.item}
              </option>
            ))}
          </select>
          <p className="terms text-left text-base font-bold ml-6">
            Apasand pe "Ridicare produs", sunteți de acord cu{" "}
            <Link to="/terms" className="text-[red] underline">Termenii de utilizare</Link>, inclusiv cu clauza
            de arbitraj și luați la cunoștință{" "}
            <Link to="/donator" className="text-[red] underline">Politica de confidențialitate.</Link>
          </p>
          <button
            className="button"
            onClick={addData}
          >
            Ridica produs
          </button>
        </div>
        <div className="logo-container"></div>
      </div>
    </div>
  );
}
