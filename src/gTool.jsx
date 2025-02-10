import React, { useState, useCallback } from 'react';
import { Search, User, Filter, MapPin, Star, GitFork } from 'lucide-react';
import Navbar from './Navbar'
const GTool = () => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    location: '',
    minFollowers: '',
    minRepos: '',
    language: '',
    sortBy: 'followers'
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const programminLanguages = [
    'JavaScript', 'Python', 'Java', 'TypeScript',
    'C++', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'
  ];

  const searchGitHub = useCallback(async (reset = true) => {
    if (loading) return;

    setLoading(true);
    const currentPage = reset ? 1 : page;

    const { name, location, minFollowers, minRepos, language, sortBy } = searchParams;

    let query = [];
    if (name) query.push(`${name}+in:name`);
    if (location) query.push(`location:${location}`);
    if (minFollowers) query.push(`followers:>=${minFollowers}`);
    if (minRepos) query.push(`repos:>=${minRepos}`);
    if (language) query.push(`language:${language}`);

    const queryString = query.join('+');
    const url = `https://api.github.com/search/users?q=${queryString}&sort=${sortBy}&page=${currentPage}&per_page=30`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      setTotalResults(data.total_count);

      const userDetailsPromises = data.items.map(async (user) => {
        const userResponse = await fetch(user.url);
        const userData = await userResponse.json();
        return {
          ...user,
          ...userData
        };
      });

      const enrichedUsers = await Promise.all(userDetailsPromises);

      setUsers(prev => reset ? enrichedUsers : [...prev, ...enrichedUsers]);
      setPage(prev => reset ? 2 : prev + 1);
    } catch (error) {
      console.error("GitHub Search Error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, page, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">
            gTool By Akash
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={searchParams.name}
                onChange={handleInputChange}
                className="w-full pl-10 p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={searchParams.location}
                onChange={handleInputChange}
                className="w-full pl-10 p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              name="language"
              value={searchParams.language}
              onChange={handleInputChange}
              className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Language</option>
              {programminLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Star className="absolute left-3 top-3 text-gray-500" />
              <input
                type="number"
                name="minFollowers"
                placeholder="Min Followers"
                value={searchParams.minFollowers}
                onChange={handleInputChange}
                className="w-full pl-10 p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <GitFork className="absolute left-3 top-3 text-gray-500" />
              <input
                type="number"
                name="minRepos"
                placeholder="Min Repositories"
                value={searchParams.minRepos}
                onChange={handleInputChange}
                className="w-full pl-10 p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              name="sortBy"
              value={searchParams.sortBy}
              onChange={handleInputChange}
              className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="followers">Sort by Followers</option>
              <option value="repositories">Sort by Repositories</option>
              <option value="joined">Sort by Join Date</option>
            </select>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={() => searchGitHub(true)}
              disabled={loading}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search GitHub'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {users.map(user => (
              <div
                key={user.id}
                className="bg-gray-800 rounded-lg p-4 transform transition hover:scale-105 hover:shadow-lg"
              >
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500"
                />
                <h3 className="text-center font-bold text-blue-400">{user.login}</h3>
                <div className="text-center mt-2">
                  <p>Followers: {user.followers}</p>
                  <p>Public Repos: {user.public_repos}</p>
                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && !loading && (
            <div className="text-center mt-6">
              <p className="text-red-400">No users found. Try different search criteria.</p>
            </div>
          )}
        </div>
      </div>

      <footer class="bg-dark rounded-lg shadow-sm m-4 dark:bg-gray-800">
        <div class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">© <a href="https://flowbite.com/" class="hover:underline">www.skytup.com</a>. All Rights Reserved.
          </span>
          <ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
            <li>
              <a href="https://akash.skytup.com" class="hover:underline me-4 md:me-6">Akash</a>
            </li>
            <li>
              <a href="https://github.com/akash2v/gTool" class="hover:underline me-4 md:me-6">Source Code</a>
            </li>
            <li>
              <a href="https://www.skytup.com" class="hover:underline me-4 md:me-6">Website</a>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
};

export default GTool;