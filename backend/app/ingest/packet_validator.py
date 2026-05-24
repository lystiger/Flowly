from app.models.telemetry import TelemetryPacket

class PacketValidator:
    @staticmethod
    def is_valid(packet: TelemetryPacket) -> bool:
        """
        Performs business logic validation on a TelemetryPacket.
        Checks:
        - Flex sensor length is exactly 5 (already checked by Pydantic min_length/max_length)
        - ADC values are within 0-4095 range
        - Battery level is within 0-100 range
        """
        # Flex sensor ADC values check
        for value in packet.flex:
            if not (0 <= value <= 4095):
                return False
        
        # Battery check
        if not (0 <= packet.battery <= 100):
            return False
            
        return True
