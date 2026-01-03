<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $resetUrl;
    public $expiresIn;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($user, $resetUrl, $expiresIn = 60)
    {
        $this->user = $user;
        $this->resetUrl = $resetUrl;
        $this->expiresIn = $expiresIn;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Reset Your Password - HRMS')
                    ->view('emails.password-reset')
                    ->with([
                        'user' => $this->user,
                        'resetUrl' => $this->resetUrl,
                        'expiresIn' => $this->expiresIn,
                    ]);
    }
}

