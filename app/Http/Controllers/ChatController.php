<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ChatController extends Controller
{
    /**
     * Display the chat interface and handle incoming messages.
     */
    public function index(Request $request)
    {
        // Handle POST request (new message submission)
        if ($request->isMethod('post')) {
            $request->validate([
                'message' => 'required|string|max:1000',
            ]);

            $userMessage = $request->input('message');

            try {
                $client = new Client();
                $response = $client->post('https://openrouter.ai/api/v1/chat/completions', [
                    'headers' => [
                        'Authorization' => 'Bearer ' . env('OPENROUTER_API_KEY'),
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'model' => 'meta-llama/llama-4-maverick:free',
                        'messages' => [
                            ['role' => 'user', 'content' => $userMessage],
                        ],
                    ],
                ]);

                $data = json_decode($response->getBody(), true);
                $aiMessage = $data['choices'][0]['message']['content'] ?? 'No response from AI.';

                return Inertia::render('chat/index', [
                    'initialMessages' => [],
                    'flash' => [
                        'data' => [
                            'userMessage' => $userMessage,
                            'aiMessage' => $aiMessage,
                        ],
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('OpenRouter API error: ' . $e->getMessage());
                return Inertia::render('Chat', [
                    'initialMessages' => [],
                    'flash' => [
                        'error' => 'Failed to get AI response. Please try again.',
                    ],
                ]);
            }
        }

        // Handle GET request (display chat interface)
        return Inertia::render('chat/index', [
            'initialMessages' => [],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
