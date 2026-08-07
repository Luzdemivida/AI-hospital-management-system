namespace HospitalQueueAPI.DTOs.Admin;

public class UserStatisticsDto
{
    public int TotalUsers { get; set; }

    public int TotalDoctors { get; set; }

    public int TotalPatients { get; set; }

    public int TotalAdmins { get; set; }
}