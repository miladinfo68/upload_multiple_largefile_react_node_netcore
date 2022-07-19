namespace back;

public class ResponseContext
{
    public dynamic Data { get; set; }
    public bool IsSuccess { get; set; } = true;
    public int StatusCode { get; set; } = StatusCodes.Status200OK;
    public string ErrorMessage { get; set; }
}
