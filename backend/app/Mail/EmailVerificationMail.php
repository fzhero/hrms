<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmailVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $verificationUrl;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($user, $verificationUrl)
    {
        $this->user = $user;
        $this->verificationUrl = $verificationUrl;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Verify Your Email Address - HRMS')
                    ->view('emails.verify-email')
                    ->with([
                        'user' => $this->user,
                        'verificationUrl' => $this->verificationUrl,
                    ]);
    }
}

