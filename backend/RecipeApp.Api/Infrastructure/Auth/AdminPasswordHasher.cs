using System.Security.Cryptography;
using System.Text;

namespace RecipeApp.Api.Infrastructure;

public sealed class AdminPasswordHasher
{
    private const string Pbkdf2Sha256Scheme = "pbkdf2-sha256";

    public bool Verify(string password, string? configuredPasswordHash, string? configuredLegacyPassword)
    {
        if (!string.IsNullOrWhiteSpace(configuredPasswordHash))
        {
            return VerifyHash(password, configuredPasswordHash);
        }

        return !string.IsNullOrWhiteSpace(configuredLegacyPassword) &&
               string.Equals(password, configuredLegacyPassword, StringComparison.Ordinal);
    }

    public static string HashPassword(string password, int iterations = 100_000)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var derivedBytes = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            saltBytes,
            iterations,
            HashAlgorithmName.SHA256,
            32);

        return string.Join(
            "$",
            Pbkdf2Sha256Scheme,
            iterations.ToString(),
            Convert.ToBase64String(saltBytes),
            Convert.ToBase64String(derivedBytes));
    }

    private static bool VerifyHash(string password, string configuredPasswordHash)
    {
        var parts = configuredPasswordHash.Split('$', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 4 || !string.Equals(parts[0], Pbkdf2Sha256Scheme, StringComparison.Ordinal))
        {
            return false;
        }

        if (!int.TryParse(parts[1], out var iterations) || iterations <= 0)
        {
            return false;
        }

        try
        {
            var saltBytes = Convert.FromBase64String(parts[2]);
            var expectedHashBytes = Convert.FromBase64String(parts[3]);
            var actualHashBytes = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password),
                saltBytes,
                iterations,
                HashAlgorithmName.SHA256,
                expectedHashBytes.Length);

            return CryptographicOperations.FixedTimeEquals(actualHashBytes, expectedHashBytes);
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
