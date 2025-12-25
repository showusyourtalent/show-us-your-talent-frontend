import React from 'react';
import EditionForm from '../promoteur/EditionForm';

// Pour l'admin, on réutilise le même formulaire mais avec plus de permissions
const EditionFormAdmin = () => {
  return <EditionForm />;
};

export default EditionFormAdmin;