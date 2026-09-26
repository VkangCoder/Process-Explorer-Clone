namespace ProcessExplorer.Api.Features.ProcessMonitoring;

using System.Text;


static class PackerHeuristic
{
    static readonly HashSet<string> KnownPackerSections = new(StringComparer.OrdinalIgnoreCase)
    {
        "UPX0", "UPX1", "UPX2",
        ".aspack", ".adata", ".ASPack",
        ".petite", ".perplex",
        ".themida", ".taz",
        ".vmp0", ".vmp1", ".vmp2",
        ".enigma1", ".enigma2",
        ".mpress1", ".mpress2",
        ".nsp0", ".nsp1", ".nsp2",
        ".packed", ".pklstb",
        ".fsg", ".ccg", ".pec1", ".pec2",
        "kkrunchy",
    };

    public static bool LooksPacked(string? exePath)
    {
        if (string.IsNullOrEmpty(exePath))
            return false;

        try
        {
            using var stream = new FileStream(exePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var reader = new BinaryReader(stream);

            if (stream.Length < 0x40)
                return false;

            stream.Seek(0x3C, SeekOrigin.Begin);
            int peOffset = reader.ReadInt32();
            if (peOffset <= 0 || peOffset + 24 >= stream.Length)
                return false;

            stream.Seek(peOffset, SeekOrigin.Begin);
            uint peSignature = reader.ReadUInt32();
            if (peSignature != 0x00004550) // "PE\0\0"
                return false;

            reader.ReadUInt16(); // Machine
            ushort numberOfSections = reader.ReadUInt16();
            reader.ReadUInt32(); // TimeDateStamp
            reader.ReadUInt32(); // PointerToSymbolTable
            reader.ReadUInt32(); // NumberOfSymbols
            ushort sizeOfOptionalHeader = reader.ReadUInt16();
            reader.ReadUInt16(); // Characteristics

            stream.Seek(sizeOfOptionalHeader, SeekOrigin.Current);

            if (numberOfSections == 0 || numberOfSections > 96)
                return false;

            for (int i = 0; i < numberOfSections; i++)
            {
                if (stream.Position + 40 > stream.Length)
                    break;

                byte[] nameBytes = reader.ReadBytes(8);
                string sectionName = Encoding.ASCII.GetString(nameBytes).TrimEnd('\0');

                if (KnownPackerSections.Contains(sectionName))
                    return true;

                stream.Seek(32, SeekOrigin.Current); // remainder of IMAGE_SECTION_HEADER (40 - 8 bytes)
            }

            return false;
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or EndOfStreamException)
        {
            return false;
        }
    }
}
