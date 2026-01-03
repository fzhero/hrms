<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('department')->nullable();
            $table->string('designation')->nullable();
            $table->date('joining_date')->nullable();
            $table->decimal('salary', 10, 2)->nullable();
            $table->string('profile_photo')->nullable();
            $table->json('documents')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('department');
            $table->index('designation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
    }
};

