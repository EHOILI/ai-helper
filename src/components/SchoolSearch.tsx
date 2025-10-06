
import React, { useEffect, useState } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import api from '../api';

interface SchoolSearchProps {
  school: string | null;
  setSchool: (school: string | null) => void;
}

function SchoolSearch({ school, setSchool }: SchoolSearchProps) {
  const [schools, setSchools] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await api.get<string[]>('/schools');
        setSchools(response.data);
      } catch (error) {
        console.error('Failed to fetch schools:', error);
      }
    };
    fetchSchools();
  }, []);

  return (
    <Autocomplete
      value={school}
      onChange={(event, newValue) => {
        setSchool(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      id="school-search"
      options={schools}
      sx={{ width: '100%' }}
      renderInput={(params) => <TextField {...params} label="School" required />}
    />
  );
}

export default SchoolSearch;
