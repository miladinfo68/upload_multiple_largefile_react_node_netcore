using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;

namespace back.Controllers;

[ApiController]
[Route("[controller]")]
public class FileManagementController : ControllerBase
{
    private IConfiguration _configuration;
    private readonly ILogger<FileManagementController> _logger;

    public int chunkSize;
    private readonly ResponseContext _responseData;

    public FileManagementController(IConfiguration configuration, ILogger<FileManagementController> logger)
    {
        _logger = logger;
        _configuration = configuration;
        chunkSize = 1024 * 1024 * Convert.ToInt32(configuration["ChunkSize"]);
        _responseData = new ResponseContext();
    }

    private void SetErrorResult(string message)
    {
        _responseData.ErrorMessage = message;
        _responseData.IsSuccess = false;
    }

    private void AppendFile(StreamWriter sw, string path)
    {
        char[] block = new char[chunkSize];
        using (StreamReader sr = new StreamReader(path))
        {
            while (!sr.EndOfStream)
            {
                int chars = sr.Read(block, 0, chunkSize);
                sw.Write(block, 0, chars);
            }
        }
    }
    [HttpPost("MergeAllChunks")]
    public async Task<IActionResult> MergeAllChunks([FromBody] MergeModel data)
    {
        var fileName = data.FileName;
        FileStream fs1 = null;
        FileStream fs2 = null;
        try
        {
            var rootDir = Directory.GetCurrentDirectory();
            var fn = Path.GetFileNameWithoutExtension(fileName);
            var ext = Path.GetExtension(fileName);

            var fileChunksDir = $"{rootDir}/Uploaded/{fn}/Chunks";
            var mergedFile = $"{rootDir}/Uploaded/{fn}/Chunks/merged{ext}";
            if (!Directory.Exists(fileChunksDir))
            {
                SetErrorResult("There is no chunks to merge");
                return Ok(_responseData);
            }

            var chunks = Directory.GetFiles(fileChunksDir, "*.*", SearchOption.TopDirectoryOnly);

            if (chunks?.Length > 1)
            {
                if (System.IO.File.Exists(mergedFile))
                    System.IO.File.Delete(mergedFile);

                fs1 = System.IO.File.Open(mergedFile, FileMode.OpenOrCreate, FileAccess.Write, FileShare.ReadWrite);
                chunks.ToList().ForEach(chunk =>
                {
                    fs2 = System.IO.File.Open(chunk, FileMode.Open);
                    byte[] fs2Content = new byte[fs2.Length];
                    fs2.Read(fs2Content, 0, (int)fs2.Length);
                    fs1.Write(fs2Content, 0, (int)fs2.Length);
                });
            }

        }
        catch (Exception ex)
        {
            SetErrorResult($"{ex.Message} : {ex.StackTrace}");
        }
        finally
        {
            if (fs1 != null) fs1.Close();
            if (fs2 != null) fs2.Close();
        }
        return Ok(_responseData);
    }

    [RequestSizeLimit(1000 * 1024 * 1024)]
    [HttpPost("UploadCurrentChunk")]
    public async Task<IActionResult> UploadCurrentChunk([FromForm] ChunkDataModel data)
    {
        try
        {
            var chunkNumber = data.currentChunkNo.ToString().PadLeft(4, '0');

            var rootDir = Directory.GetCurrentDirectory();
            var fn = Path.GetFileNameWithoutExtension(data.OriginalFileName);
            var ext = Path.GetExtension(data.OriginalFileName);

            var filePath = $"{rootDir}/Uploaded/{fn}";
            var fileChunksDir = $"{rootDir}/Uploaded/{fn}/Chunks";

            if (!Directory.Exists(fileChunksDir))
                Directory.CreateDirectory(fileChunksDir);

            var chunkFile = $"{fileChunksDir}/{chunkNumber}{ext}";

            using Stream stream = new FileStream(chunkFile, FileMode.Create);
            await data.BlobChunkValue.CopyToAsync(stream);
            stream.Close();


            //int bytesRead = 0;
            //byte[] bytes = new byte[chunkSize];

            //using FileStream fs = System.IO.File.Create(chunkFile);
            //while ((bytesRead = await Request.Body.ReadAsync(bytes, 0, bytes.Length)) > 0)
            //{
            //    fs.Write(bytes, 0, bytesRead);
            //}

            //return StatusCode(StatusCodes.Status200OK);
        }
        catch (Exception ex)
        {
            SetErrorResult(ex.Message);
            //return StatusCode(StatusCodes.Status500InternalServerError);
        }
        return Ok(_responseData);
    }


    //[RequestSizeLimit(1000*1024*1024)]
    //[HttpPost("UploadChunks")]
    //public async Task<IActionResult> UploadChunks(int chunkNo, string originFileName, string mimeType, int totalChunks = 0)
    //{

    //    try
    //    {
    //        if (totalChunks == 0)
    //        {
    //            SetErrorResult("Invalid File Size");
    //            return Ok(_responseData);
    //        }


    //        var chunkNumber = chunkNo.ToString().PadLeft(4, '0');

    //        var rootDir = Directory.GetCurrentDirectory();
    //        var fn = Path.GetFileNameWithoutExtension(originFileName);
    //        var ext = Path.GetExtension(originFileName);

    //        var filePath = $"{rootDir}/Uploaded/{fn}";
    //        var fileChunksDir = $"{rootDir}/Uploaded/{fn}/Chunks";

    //        if (!Directory.Exists(fileChunksDir))
    //            Directory.CreateDirectory(fileChunksDir);

    //        var chunkFile = $"{fileChunksDir}/{chunkNumber}{ext}";

    //        int bytesRead = 0;
    //        byte[] bytes = new byte[chunkSize];

    //        using FileStream fs = System.IO.File.Create(chunkFile);
    //        while ((bytesRead = await Request.Body.ReadAsync(bytes, 0, bytes.Length)) > 0)
    //        {
    //            fs.Write(bytes, 0, bytesRead);
    //        }
    //    }
    //    catch (Exception ex)
    //    {
    //        SetErrorResult(ex.Message);
    //    }
    //    return Ok(_responseData);
    //}



    //private static void MergeChunks(string chunk1, string chunk2)
    //{
    //    FileStream fs1 = null;
    //    FileStream fs2 = null;
    //    try
    //    {
    //        fs1 = System.IO.File.Open(chunk1, FileMode.Append);
    //        fs2 = System.IO.File.Open(chunk2, FileMode.Open);
    //        byte[] fs2Content = new byte[fs2.Length];
    //        fs2.Read(fs2Content, 0, (int)fs2.Length);
    //        fs1.Write(fs2Content, 0, (int)fs2.Length);
    //    }
    //    catch (Exception ex)
    //    {
    //        Console.WriteLine(ex.Message + " : " + ex.StackTrace);
    //    }
    //    finally
    //    {
    //        if (fs1 != null) fs1.Close();
    //        if (fs2 != null) fs2.Close();
    //        System.IO.File.Delete(chunk2);
    //    }
    //}
}
