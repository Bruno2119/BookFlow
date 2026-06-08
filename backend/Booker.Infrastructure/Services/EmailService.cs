using Booker.Core.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace Booker.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // Mock Implementation: Logs the email instead of sending it.
        // In production, you would use SmtpClient or a service like SendGrid/Mailgun.
        
        _logger.LogInformation("SIMULANDO ENVIO DE EMAIL:");
        _logger.LogInformation($"PARA: {to}");
        _logger.LogInformation($"ASSUNTO: {subject}");
        _logger.LogInformation($"CORPO: {body}");

        await Task.CompletedTask;
    }
}
