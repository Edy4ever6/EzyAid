import React from 'react'
import {Link} from 'react-router-dom'

const Terms = () => {
  return (
    <div className='terms-ctn gap-[2rem]'><p className='terms-text '>Prin prezenta, declar că sunt de acord cu prelucrarea datelor mele cu caracter 
      personal în conformitate cu prevederile Regulamentului UE 2016/679 al Parlamentului 
      European şi al Consiliului din 27 aprilie 2016 privind protecţia persoanelor fizice 
      în ceea ce priveşte prelucrarea datelor cu caracter personal şi privind libera 
      circulaţie a acestor date (GDPR).
    Îmi dau consimțământul pentru ca datele mele cu caracter personal, inclusiv nume, 
    prenume, CNP, adresă de domiciliu/corespondență, adresă de e-mail, și număr de telefon 
    să fie prelucrate de către [Numele Operatorului] în scopul [Scopul Prelucrării], în condițiile de acces la platforma [Numele Platformei] și a serviciilor online ale [Numele Companiei], în conformitate cu legile privind protecția datelor.
    
    Înțeleg că datele mele pot fi comunicate numai destinatarilor abilitați prin acte
     normative, inclusiv organelor de poliție, parchetelor, instanțelor sau altor autorități publice, în condițiile legii.
     </p>
     <button className='button '><Link to="/user">Accepta</Link></button>
     </div>
  )
}

export default Terms