<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DeepSeekController extends Controller
{
    public function query(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENROUTER_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => 'deepseek/deepseek-r1:free',
            'messages' => [
                ['role' => 'system', 'content' => 'Kamu adalah chatbot'],
                ['role' => 'user', 'content' => $request->input('prompt')],
            ],
        ]);

        return response()->json($response->json());
    }
}
