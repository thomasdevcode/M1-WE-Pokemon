import React, { useState } from 'react';
import { FunLayout } from '@/components/layouts/FunLayout';
import { Spinner } from '@/components/loaders/Spinner';
import { PokeType } from '@/components/icons/PokeType';
import { PokemonCard } from '@/features/game-database/pokemon/components/PokemonCard';
import { PokeAPIData, PokeAPIResponse } from '@/interfaces/poke-api';
import { useRouter } from 'next/router';

const TeamBuilder: React.FC = () => {
    const router = useRouter();
    const [team, setTeam] = useState<(PokeAPIData | null)[]>(Array(6).fill(null));
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PokeAPIData[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

    const searchPokemon = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setLoading(true);
        try {
            const listRes = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=1000');
            const listData: PokeAPIResponse = await listRes.json();

            const filtered = listData.results
                .filter(p => p.name.toLowerCase().startsWith(query.toLowerCase()))
                .slice(0, 10);

            const pokemonData = await Promise.all(
                filtered.map(async (p) => {
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`);
                    return res.json();
                })
            );
            setSearchResults(pokemonData);
        } catch {
            setSearchResults([]);
        }
        setLoading(false);
    };

    const addPokemonToTeam = (pokemon: PokeAPIData, slotIndex: number) => {
        const newTeam = [...team];
        newTeam[slotIndex] = pokemon;
        setTeam(newTeam);
        setSelectedSlot(null);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removePokemonFromTeam = (slotIndex: number) => {
        const newTeam = [...team];
        newTeam[slotIndex] = null;
        setTeam(newTeam);
    };

    return (
        <FunLayout>
            <div
                className="w-full h-full p-4 overflow-y-auto relative"
                style={{
                    backgroundImage: 'url("https://media.digitalpainting.school/media/cache/creation_full_uhd/uploads/creation/th/e-/the-journey-begins-rs-pokemon--62062029.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="relative z-10 max-w-6xl mx-auto">

                    <div className="flex justify-start items-center mb-8">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm border border-white/30"
                        >
                            ← Return
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-0 lg:mt-20 gap-4 mb-8">
                        {team.map((pokemon, index) => (
                            <div key={index} className="relative">
                                {pokemon ? (
                                    <>
                                        <PokemonCard
                                            id={pokemon.id}
                                            name={pokemon.name}
                                            data={{
                                                abilities: [],
                                                metaData: {
                                                    cries: '',
                                                    baseExperience: pokemon.base_experience,
                                                    height: pokemon.height,
                                                    weight: pokemon.weight
                                                },
                                                index: pokemon.id,
                                                species: pokemon.species.name,
                                                types: pokemon.types.map(t => t.type.name),
                                                stats: {},
                                                heldItems: [],
                                                moves: {},
                                                sprites: [{
                                                    game: 'official-artwork',
                                                    url: pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default
                                                }]
                                            }}
                                        />
                                        <button
                                            onClick={() => removePokemonFromTeam(index)}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
                                        >
                                            ×
                                        </button>
                                    </>
                                ) : (
                                    <div
                                        onClick={() => setSelectedSlot(index)}
                                        className="h-40 border-2 border-dashed border-white/50 rounded-semi flex items-center justify-center cursor-pointer hover:border-white/70 transition-colors bg-black/30"
                                    >
                                        <div className="text-center text-white">
                                            <div className="text-2xl mb-1">+</div>
                                            <span className="text-sm">Add Pokemon</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {selectedSlot !== null && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Select Pokemon for Slot {selectedSlot + 1}</h3>
                                    <button
                                        onClick={() => setSelectedSlot(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ×
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        searchPokemon(e.target.value);
                                    }}
                                    placeholder="Search Pokemon by name..."
                                    className="w-full p-2 border rounded mb-4"
                                    autoFocus
                                />

                                {loading && (
                                    <div className="flex justify-center py-4">
                                        <Spinner size={32} />
                                    </div>
                                )}

                                <div className="max-h-60 overflow-y-auto">
                                    {searchResults.map((pokemon) => (
                                        <div
                                            key={pokemon.id}
                                            onClick={() => addPokemonToTeam(pokemon, selectedSlot)}
                                            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded"
                                        >
                                            <img
                                                src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default}
                                                alt={pokemon.name}
                                                className="w-12 h-12 mr-3"
                                            />
                                            <div>
                                                <div className="font-medium capitalize">{pokemon.name}</div>
                                                <div className="flex gap-1 mt-1">
                                                    {pokemon.types.map((typeData, index) => (
                                                        <PokeType
                                                            key={index}
                                                            type={typeData.type.name}
                                                            className="text-xs px-2 py-1 rounded"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </FunLayout>
    );
};

export default TeamBuilder;