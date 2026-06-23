import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import {
  TextField,
  Popper,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
  alpha,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { buildSearchIndex, type SearchEntry } from '../../../../core/utils/searchIndex';

interface SearchBarProps {
  fullWidth?: boolean;
  placeholder?: string;
  permisos?: string[];
}

const SearchBar = ({ fullWidth = false, placeholder = 'Buscar (escribe al menos 2 caracteres)', permisos }: SearchBarProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [openResults, setOpenResults] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const options: SearchEntry[] = useMemo(() => {
    const entries = buildSearchIndex();
    if (!permisos || permisos.length === 0) return entries;
    return entries.filter((entry) => {
      if (!entry.permiso) return true;
      return permisos.includes(entry.permiso);
    });
  }, [permisos]);

  const fuse = useMemo(
    () =>
      new Fuse(options, {
        keys: ['label', 'module', 'locationText', 'keywords', 'path', 'synonyms'],
        threshold: 0.35,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [options],
  );

  const resolveResults = useCallback(
    (searchText: string) => {
      if (!searchText || searchText.trim().length < 2) return [];
      return fuse.search(searchText.trim()).map((r) => r.item);
    },
    [fuse],
  );

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      const d = setTimeout(() => {
        setResults([]);
        setOpenResults(false);
      }, 0);
      return () => clearTimeout(d);
    }

    const t = setTimeout(() => {
      const matched = resolveResults(query);
      setResults(matched);
      setOpenResults(matched.length > 0);
    }, 220);

    return () => clearTimeout(t);
  }, [query, resolveResults]);

  const handleNavigate = (path?: string) => {
    if (path) {
      navigate(path);
      setQuery('');
      setOpenResults(false);
    }
  };

  useEffect(() => {
    if (openResults) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          anchorEl &&
          !anchorEl.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node) &&
          resultsRef.current &&
          !resultsRef.current.contains(event.target as Node)
        ) {
          setOpenResults(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openResults, anchorEl]);

  return (
    <Box 
      ref={setAnchorEl}
      sx={{ position: 'relative', width: fullWidth ? '100%' : { md: 420 } }}
    >
      <TextField
        ref={inputRef}
        size="small"
        fullWidth={fullWidth}
        placeholder={placeholder}
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            const matched = resolveResults(query);
            setResults(matched);
            setOpenResults(matched.length > 0);
          }
        }}
        onFocus={() => {
          if (query.length >= 2 && results.length > 0) {
            setOpenResults(true);
          }
        }}
        InputProps={{
          startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
        }}
        sx={{ background: alpha('#f4f7fa', 1), borderRadius: 2 }}
        inputProps={{ 'aria-label': 'buscar' }}
      />

      <Popper
        open={openResults}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ zIndex: 1400, width: '100%' }}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              padding: 8,
            },
          },
        ]}
      >
        <Paper
          ref={resultsRef}
          elevation={3}
          sx={{ width: fullWidth ? '100%' : 420, maxHeight: 400, overflowY: 'auto' }}
        >
          <List dense>
            {results.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                No se encontraron resultados
              </Box>
            ) : (
              results.map((r) => (
                <div key={`${r.label}-${r.path ?? ''}`}>
                  <ListItemButton
                    onClick={() => handleNavigate(r.path)}
                    disabled={!r.path}
                    sx={{ '&:hover': { bgcolor: alpha('#6889b8', 0.1) } }}
                  >
                    <ListItemText primary={r.label} secondary={r.locationText} />
                  </ListItemButton>
                  <Divider />
                </div>
              ))
            )}
          </List>
        </Paper>
      </Popper>
    </Box>
  );
};

export default SearchBar;
