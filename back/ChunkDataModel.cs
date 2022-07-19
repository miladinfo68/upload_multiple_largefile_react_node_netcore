namespace back
{
    public record ChunkDataModel
    {
        public string OriginalFileName { get; set; }
        public string MimeType { get; set; }
        public int TotalChunks { get; set; }
        public int currentChunkNo { get; set; }
        public IFormFile BlobChunkValue { get; set; }

        //public List<IFormFile> FormFiles { get; set; }
    }

    public record MergeModel
    {
        public string FileName { get; set; }

    }
}
