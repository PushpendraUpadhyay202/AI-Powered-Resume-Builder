using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Razorpay.Api;

namespace PaymentService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public PaymentController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpPost("create-order")]
        [Authorize]
        public IActionResult CreateOrder()
        {
            try
            {
                string keyId = _configuration["Razorpay:KeyId"];
                string keySecret = _configuration["Razorpay:KeySecret"];

                RazorpayClient client = new RazorpayClient(keyId, keySecret);

                Dictionary<string, object> options = new Dictionary<string, object>();
                options.Add("amount", 49900); // amount in the smallest currency unit (499.00 INR)
                options.Add("currency", "INR");
                options.Add("receipt", "order_rcptid_" + DateTime.UtcNow.Ticks);

                Order order = client.Order.Create(options);

                return Ok(new
                {
                    id = order["id"].ToString(),
                    amount = order["amount"].ToString(),
                    currency = order["currency"].ToString(),
                    keyId = keyId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Failed to create Razorpay order.", Error = ex.Message });
            }
        }

        [HttpPost("verify-payment")]
        [Authorize]
        public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerificationRequest request)
        {
            try
            {
                string keySecret = _configuration["Razorpay:KeySecret"];

                // Verify Signature
                Dictionary<string, string> attributes = new Dictionary<string, string>();
                attributes.Add("razorpay_payment_id", request.RazorpayPaymentId);
                attributes.Add("razorpay_order_id", request.RazorpayOrderId);
                attributes.Add("razorpay_signature", request.RazorpaySignature);

                Utils.verifyPaymentSignature(attributes);

                // If verification passes, upgrade user
                var authHeader = Request.Headers["Authorization"].ToString();
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authHeader);

                var authServiceUrl = _configuration["Services:AuthService"] ?? "http://localhost:5259";
                var requestBody = new { Plan = "Premium" };
                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                var response = await client.PutAsync($"{authServiceUrl}/api/user/subscription", content);

                if (response.IsSuccessStatusCode)
                {
                    return Ok(new { Success = true, Message = "Payment verified and upgraded to Premium!" });
                }

                return BadRequest(new { Success = false, Message = "Payment verified but failed to update user profile." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Payment verification failed.", Error = ex.Message });
            }
        }
    }

    public class PaymentVerificationRequest
    {
        public string RazorpayPaymentId { get; set; } = string.Empty;
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string RazorpaySignature { get; set; } = string.Empty;
    }
}
