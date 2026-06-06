package com.vendorbridge.shared.utils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SequenceGenerator {

    private final SequenceTrackerRepository sequenceTrackerRepository;

    /**
     * Generates a formatted sequence number with the pattern: PREFIX-YYYY-NNNNN
     * <p>
     * Example: RFQ-2026-00001, PO-2026-00042
     * <p>
     * The sequence resets to 1 when the year changes. Uses pessimistic locking
     * on the sequence_tracker table to ensure thread safety.
     *
     * @param sequenceType the logical type of sequence (e.g., "RFQ", "PO", "INV")
     * @param prefix       the prefix to use in the generated number
     * @return a formatted sequence number string
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateNumber(String sequenceType, String prefix) {
        int currentYear = Year.now().getValue();

        Optional<SequenceTracker> trackerOptional = sequenceTrackerRepository.findBySequenceType(sequenceType);

        SequenceTracker tracker;

        if (trackerOptional.isPresent()) {
            tracker = trackerOptional.get();

            if (tracker.getCurrentYear() != currentYear) {
                log.info("Year changed for sequence type '{}'. Resetting sequence from year {} to {}.",
                        sequenceType, tracker.getCurrentYear(), currentYear);
                tracker.setCurrentYear(currentYear);
                tracker.setCurrentValue(1L);
            } else {
                tracker.setCurrentValue(tracker.getCurrentValue() + 1);
            }
        } else {
            log.info("Creating new sequence tracker for type '{}'.", sequenceType);
            tracker = SequenceTracker.builder()
                    .sequenceType(sequenceType)
                    .currentYear(currentYear)
                    .currentValue(1L)
                    .build();
        }

        tracker = sequenceTrackerRepository.save(tracker);

        String generatedNumber = String.format("%s-%d-%05d", prefix, tracker.getCurrentYear(), tracker.getCurrentValue());
        log.debug("Generated sequence number: {}", generatedNumber);

        return generatedNumber;
    }
}
