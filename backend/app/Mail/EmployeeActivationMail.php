<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmployeeActivationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $employeeId;
    public $name;
    public $email;
    public $temporaryPassword;
    public $loginUrl;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($employeeId, $name, $email, $temporaryPassword, $loginUrl = null)
    {
        $this->employeeId = $employeeId;
        $this->name = $name;
        $this->email = $email;
        $this->temporaryPassword = $temporaryPassword;
        $this->loginUrl = $loginUrl ?? url('/login');
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Welcome to HRMS - Your Account Credentials')
                    ->view('emails.employee-activation')
                    ->with([
                        'employeeId' => $this->employeeId,
                        'name' => $this->name,
                        'email' => $this->email,
                        'temporaryPassword' => $this->temporaryPassword,
                        'loginUrl' => $this->loginUrl,
                    ]);
    }
}

