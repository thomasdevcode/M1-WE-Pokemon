"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';

interface PokemonBasic {
    name: string;
    url: string;
}

interface PokemonData {
    id: number;
    name: string;
    sprites: {
        front_default: string;
    };
}

const getRandomInt = (max: number) => Math.floor(Math.random() * max);

const Page: React.FC = () => {
    const router = useRouter();
    const [pokemonList, setPokemonList] = useState<PokemonBasic[]>([]);
    const [correctPokemon, setCorrectPokemon] = useState<PokemonData | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const [score, setScore] = useState(0);
    const [total, setTotal] = useState(0);

    const fetchPokemonList = async () => {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
        const data = await res.json();
        setPokemonList(data.results);
    };

    const loadNewQuestion = async () => {
        if (pokemonList.length === 0) return;

        const randomIndex = getRandomInt(pokemonList.length);
        const chosen = pokemonList[randomIndex];

        const pokeRes = await fetch(chosen.url);
        const pokeData: PokemonData = await pokeRes.json();

        setCorrectPokemon(pokeData);

        let incorrectNames: string[] = [];
        while (incorrectNames.length < 3) {
            const idx = getRandomInt(pokemonList.length);
            const name = pokemonList[idx].name;
            if (name !== pokeData.name && !incorrectNames.includes(name)) {
                incorrectNames.push(name);
            }
        }

        const allOptions = [...incorrectNames, pokeData.name];
        const shuffled = allOptions.sort(() => Math.random() - 0.5);

        setOptions(shuffled);
        setShowAnswer(false);
        setIsCorrect(null);
    };

    const handleAnswer = (name: string) => {
        const correct = name === correctPokemon?.name;
        setIsCorrect(correct);
        setShowAnswer(true);

        setTotal((t) => t + 1);
        if (correct) setScore((s) => s + 1);

        setTimeout(() => {
            loadNewQuestion();
        }, 1200);
    };

    useEffect(() => {
        fetchPokemonList();
    }, []);

    useEffect(() => {
        if (pokemonList.length > 0) {
            loadNewQuestion();
        }
    }, [pokemonList]);

    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 relative">
            <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm border border-white/30"
            >
                ← Return
            </button>

            <div className="absolute top-4 right-4 bg-white shadow-md px-4 py-2 rounded-md">
                <p className="text-xl font-bold">Score : {score}/{total}</p>
                <p className="text-sm text-gray-600">{accuracy}%</p>
            </div>

            <div className="text-center max-w-md w-full">
                <h1 className="text-4xl font-bold mb-6">What is this Pokemon ?</h1>

                {correctPokemon && (
                    <img
                        src={correctPokemon.sprites.front_default}
                        alt="pokemon silhouette"
                        className={`w-48 h-48 mx-auto mb-6 transition-all duration-0 ${showAnswer ? "" : "brightness-0"}`}
                    />
                )}

                <div className="grid grid-cols-2 gap-4">
                    {options.map((name) => (
                        <button
                            key={name}
                            onClick={() => handleAnswer(name)}
                            disabled={showAnswer}
                            className={`
                                px-4 py-2 rounded-md border text-lg capitalize
                                transition-all duration-500
                                ${showAnswer && name === correctPokemon?.name ? "bg-green-500 text-white" : ""}
                                ${showAnswer && name !== correctPokemon?.name && isCorrect === false && "bg-red-500 text-white"}
                                ${!showAnswer && "hover:bg-gray-100"}
                            `}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                {showAnswer && (
                    <p className="mt-4 text-xl font-semibold">
                        {isCorrect ? "Correct !" : `Incorrect ! It was ${correctPokemon?.name}`}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Page;
