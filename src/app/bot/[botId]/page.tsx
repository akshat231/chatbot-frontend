'use client';

import '../../global.css';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export default function BotDetailPage() {
  const { botId } = useParams();
  const fullId = Array.isArray(botId) ? botId[0] : botId;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  let id = '';
  let botName = 'Bot';

  if (fullId) {
    const parts = fullId.split('_');
    if (parts.length === 3) {
      botName = decodeURIComponent(parts[0]);
      id = parts[2];
    } else {
      id = fullId;
    }
  }

  interface DocumentData {
    documentId: string;
    name: string;
    source: string;
  }

  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [activeTab, setActiveTab] = useState<'documents' | 'configurations' | 'search'>('documents');
  const [config, setConfig] = useState({ model_name: '', model_provider: '', api_key: '', temperature: '' });
  const [originalConfig, setOriginalConfig] = useState<typeof config | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchDocs = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth_token') || '{}')?.token;
      const res = await fetch(`${baseUrl}/api/bot/getBot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ botId: id, botName, page, limit: 10 }),
      });
      const data = await res.json();
      const docs = data?.data?.documentData || [];
      setDocuments(docs);
      setHasMore(docs.length === 10);
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  useEffect(() => { if (id) fetchDocs(); }, [id, botName, page]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('auth_token') || '{}')?.token;
        const res = await fetch(`${baseUrl}/api/bot/getBotConfig`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ botId: id, name: botName }),
        });
        const data = await res.json();
        if (data?.data?.botConfig) {
          setConfig(data.data.botConfig);
          setOriginalConfig(data.data.botConfig);
        }
      } catch (err) {
        console.error('Failed to load config', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchConfig();
  }, [id, botName]);

  useEffect(() => {
    if (!originalConfig) return;
    setIsDirty(JSON.stringify(config) !== JSON.stringify(originalConfig));
  }, [config, originalConfig]);

  const handleSave = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth_token') || '{}')?.token;
      const res = await fetch(`${baseUrl}/api/bot/updateBotConfig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...config, botId: id, botName }),
      });
      const result = await res.json();
      if (res.ok) {
        alert('Configuration saved.');
        setOriginalConfig(config);
        setIsDirty(false);
      } else {
        alert(result.message || 'Error saving configuration.');
      }
    } catch (err) {
      console.error('Save failed', err);
      alert('Something went wrong while saving.');
    }
  };

  const updateField = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    if (!documentId || !documentName) return;
    const confirmed = confirm(`Delete "${documentName}"?`);
    if (!confirmed) return;
    try {
      const token = JSON.parse(localStorage.getItem('auth_token') || '{}')?.token;
      const response = await fetch(`${baseUrl}/api/doc/deleteDoc`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ botId: id, botName, docId: documentId, docName: documentName }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      setDocuments((prev) => prev.filter((doc) => doc.documentId !== documentId));
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Something went wrong.');
    }
  };

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    try {
      setSearching(true);
      const token = JSON.parse(localStorage.getItem('auth_token') || '{}')?.token;
      const res = await fetch(`${baseUrl}/api/bot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ botId: id, query: trimmedQuery }),
      });
      const result = await res.json();
      if (res.ok && result?.data?.data?.queryResult) {
        const responseText =
          typeof result.data.data.queryResult.response === 'string'
            ? result.data.data.queryResult.response.replace(/\\n/g, '\n')
            : JSON.stringify(result.data.data.queryResult);
        const newEntry = {
          query: trimmedQuery,
          response: responseText,
        };
        setSearchResults((prev) => [...prev, newEntry]);
        setSearchQuery('');
      } else {
        alert(result.message || 'Query failed.');
      }
    } catch (err) {
      console.error('Search failed', err);
      alert('Something went wrong.');
    } finally {
      setSearching(false);
    }
  };

  const AddContentModal = () => {
    const [name, setName] = useState('');
    const [rawText, setRawText] = useState('');
    const [urls, setUrls] = useState('');
    const [fileUrls, setFileUrls] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
      try {
        setLoading(true);
        const token = JSON.parse(localStorage.getItem('auth_token') || '{}')?.token;
        const payload = {
          botId: id,
          name,
          botName,
          sources: {
            rawText: rawText.trim() ? [rawText] : [],
            urls: urls.trim() ? [urls] : [],
            files: fileUrls.trim() ? [fileUrls] : [],
          },
        };
        const res = await fetch(`${baseUrl}/api/bot/addContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          alert('Content added successfully.');
          setShowAddModal(false);
          fetchDocs();
        } else {
          alert(result.message || 'Failed to add content.');
        }
      } catch (err) {
        alert('Something went wrong.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-xl flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
        <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg relative">
          <button className="absolute top-3 right-3" onClick={() => setShowAddModal(false)}>
            <X size={20} className="cursor-pointer" />
          </button>
          <h2 className="text-xl font-bold mb-4">Add Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input className="w-full p-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Raw Text</label>
              <textarea rows={2} className="w-full p-2 border rounded" value={rawText} onChange={(e) => setRawText(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">URL</label>
              <input className="w-full p-2 border rounded" value={urls} onChange={(e) => setUrls(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">File URL</label>
              <input className="w-full p-2 border rounded" value={fileUrls} onChange={(e) => setFileUrls(e.target.value)} />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
               <title>Bot Details</title>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Bot Details: <span className="text-indigo-600">{botName}</span>
      </h1>
      <div className="flex space-x-4 mb-6">
        {['documents', 'configurations', 'search'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border cursor-pointer'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Documents</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Plus size={16} /> Add Content
            </button>
          </div>
          {documents.length === 0 ? (
            <p className="text-gray-600">No documents found.</p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.documentId} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
                  {doc.source === 'uploaded' ? (
                    <span className="text-gray-800">{doc.name}</span>
                  ) : (
                    <a href={doc.source} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline break-all">
                      {doc.name}
                    </a>
                  )}
                  <button onClick={() => handleDeleteDocument(doc.documentId, doc.name)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'configurations' && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          {loading ? (
            <p className="text-gray-500">Loading configuration...</p>
          ) : (
            <>
              <div className="space-y-4">
                {['model_name', 'model_provider', 'api_key', 'temperature'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium capitalize">{field.replace('_', ' ')}</label>
                    <input
                      type={field === 'temperature' ? 'number' : 'text'}
                      step={field === 'temperature' ? '0.1' : undefined}
                      min={field === 'temperature' ? 0 : undefined}
                      max={field === 'temperature' ? 1 : undefined}
                      value={(config as any)[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button
                  onClick={handleSave}
                  disabled={!isDirty}
                  className={`px-4 py-2 rounded-lg font-semibold ${isDirty ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                >
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col h-[80vh]">
          <h2 className="text-xl font-semibold mb-4">Chat with your Bot</h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {searchResults.length === 0 && !searching && (
              <p className="text-gray-400 text-sm">Ask your bot anything about its content.</p>
            )}
            {searchResults.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="bg-indigo-100 text-indigo-800 p-3 rounded-lg self-end max-w-[80%] ml-auto">
                  <p className="text-sm font-medium">You:</p>
                  <p className="whitespace-pre-line text-sm">{item.query}</p>
                </div>
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm font-medium">Bot:</p>
                  <div className="prose prose-sm prose-gray max-w-none whitespace-pre-wrap">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                      {item.response.replace(/\\n/g, '\n')}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {searching && <div className="text-gray-500 text-sm">Searching...</div>}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded text-sm"
              placeholder="Type your question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {showAddModal && <AddContentModal />}
    </div>
  );
}